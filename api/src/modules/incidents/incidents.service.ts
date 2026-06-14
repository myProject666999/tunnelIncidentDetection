import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Incident, IncidentType, Severity, IncidentSource, IncidentStatus } from '../../entities/incident.entity';
import { CreateIncidentDto, UpdateIncidentStatusDto, IncidentQueryDto } from './dto/incident.dto';
import { EventsGateway } from '../../gateways/events.gateway';
import { IncidentTimelineService } from '../timelines/incident-timeline.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    private eventsGateway: EventsGateway,
    private timelineService: IncidentTimelineService,
    private plansService: PlansService,
  ) {}

  async findAll(query: IncidentQueryDto) {
    this.logger.debug(`Finding all incidents with query: ${JSON.stringify(query)}`);
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.tunnelId) where.tunnelId = query.tunnelId;
    if (query.startDate && query.endDate) {
      where.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.incidentsRepository.findAndCount({
      where,
      relations: ['tunnel', 'creator'],
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      items: items.map((incident) => this.mapToVo(incident)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    this.logger.debug(`Finding incident with id: ${id}`);
    const incident = await this.incidentsRepository.findOne({
      where: { id },
      relations: ['tunnel', 'creator'],
    });
    if (!incident) {
      throw new NotFoundException(`事件 #${id} 不存在`);
    }
    return this.mapToVo(incident);
  }

  async create(createIncidentDto: CreateIncidentDto, userId: number, username: string) {
    this.logger.debug(`Creating incident of type: ${createIncidentDto.type}`);
    const incidentNo = await this.generateIncidentNo();

    const incident = this.incidentsRepository.create({
      ...createIncidentDto,
      incidentNo,
      status: IncidentStatus.PENDING,
      createdBy: userId,
    });

    const saved = await this.incidentsRepository.save(incident);
    const result = await this.findOne(saved.id);

    await this.timelineService.create({
      incidentId: saved.id,
      event: '事件创建',
      operatorId: userId,
      detail: `${username} 创建了事件 #${incidentNo}，类型：${this.translateType(saved.type)}，严重程度：${this.translateSeverity(saved.severity)}`,
    });

    this.eventsGateway.emitIncidentCreated(result);
    return result;
  }

  async updateStatus(id: number, updateDto: UpdateIncidentStatusDto, userId: number, username: string) {
    this.logger.debug(`Updating incident #${id} status to: ${updateDto.status}`);
    const incident = await this.incidentsRepository.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`事件 #${id} 不存在`);
    }

    const oldStatus = incident.status;
    incident.status = updateDto.status;

    if (updateDto.status === IncidentStatus.CLOSED) {
      incident.closedAt = new Date();
    }

    await this.incidentsRepository.save(incident);
    const result = await this.findOne(id);

    await this.timelineService.create({
      incidentId: id,
      operatorId: userId,
      event: '状态更新',
      detail: `${username} 将事件状态从 ${this.translateStatus(oldStatus)} 更新为 ${this.translateStatus(updateDto.status)}`,
    });

    this.eventsGateway.emitIncidentUpdated(result);
    return result;
  }

  async simulateVideoDetection(createIncidentDto: CreateIncidentDto) {
    this.logger.debug(`Simulating video detection for type: ${createIncidentDto.type}`);
    const incidentNo = await this.generateIncidentNo();

    const incident = this.incidentsRepository.create({
      ...createIncidentDto,
      source: IncidentSource.VIDEO_DETECTION,
      incidentNo,
      status: IncidentStatus.PENDING,
      createdBy: 1,
    });

    const saved = await this.incidentsRepository.save(incident);
    const result = await this.findOne(saved.id);

    await this.timelineService.create({
      incidentId: saved.id,
      event: '视频检测告警',
      operatorId: null,
      detail: `视频检测算法自动上报事件 #${incidentNo}，类型：${this.translateType(saved.type)}，位置：里程桩 ${saved.mileage}m`,
    });

    const plan = await this.plansService.findByTypeAndSeverity(
      saved.type as any,
      saved.severity as any,
    );

    if (plan) {
      await this.incidentsRepository.update(saved.id, { planId: plan.id });
      this.logger.debug(`Auto-matched plan: ${plan.name} for incident #${incidentNo}`);
    }

    this.eventsGateway.emitIncidentCreated(result);
    return { ...result, planId: plan?.id || null };
  }

  private async generateIncidentNo(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INC${dateStr}`;

    const count = await this.incidentsRepository.count({
      where: {
        incidentNo: Like(`${prefix}%`),
      },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }

  private mapToVo(incident: Incident) {
    return {
      id: incident.id,
      incidentNo: incident.incidentNo,
      tunnelId: incident.tunnelId,
      tunnelName: incident.tunnel?.name || '',
      mileage: incident.mileage,
      type: incident.type,
      severity: incident.severity,
      source: incident.source,
      reporterName: incident.reporterName || '',
      description: incident.description,
      status: incident.status,
      planId: incident.planId,
      createdBy: incident.createdBy,
      creatorName: incident.creator?.displayName || '',
      createdAt: incident.createdAt,
      closedAt: incident.closedAt,
    };
  }

  private translateType(type: IncidentType): string {
    const map = {
      [IncidentType.BREAKDOWN]: '车辆抛锚',
      [IncidentType.REAR_END]: '追尾事故',
      [IncidentType.INTRUSION]: '人员闯入',
      [IncidentType.FIRE]: '火灾',
      [IncidentType.WRONG_WAY]: '车辆逆行',
      [IncidentType.DEBRIS]: '物品散落',
    };
    return map[type] || type;
  }

  private translateSeverity(severity: Severity): string {
    const map = {
      [Severity.MINOR]: '一般',
      [Severity.MODERATE]: '较大',
      [Severity.MAJOR]: '重大',
      [Severity.CRITICAL]: '特别重大',
    };
    return map[severity] || severity;
  }

  private translateStatus(status: IncidentStatus): string {
    const map = {
      [IncidentStatus.PENDING]: '待处置',
      [IncidentStatus.RESPONDING]: '处置中',
      [IncidentStatus.RESOLVED]: '已解决',
      [IncidentStatus.CLOSED]: '已关闭',
    };
    return map[status] || status;
  }
}
