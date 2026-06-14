import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Incident, IncidentStatus } from '../../entities/incident.entity';
import { IncidentTimelineService } from '../timelines/incident-timeline.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    private timelineService: IncidentTimelineService,
  ) {}

  async findAll(query: { page?: number; pageSize?: number; startDate?: string; endDate?: string }) {
    this.logger.debug('Finding all reports');
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { status: IncidentStatus.CLOSED };
    if (query.startDate && query.endDate) {
      where.closedAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const [items, total] = await this.incidentsRepository.findAndCount({
      where,
      relations: ['tunnel', 'creator'],
      order: { closedAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      items: items.map((incident) => ({
        id: incident.id,
        incidentNo: incident.incidentNo,
        tunnelName: incident.tunnel?.name || '',
        type: incident.type,
        severity: incident.severity,
        source: incident.source,
        description: incident.description,
        createdAt: incident.createdAt,
        closedAt: incident.closedAt,
        responseDuration: incident.closedAt
          ? Math.round((incident.closedAt.getTime() - incident.createdAt.getTime()) / 1000)
          : 0,
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    this.logger.debug(`Finding report for incident #${id}`);
    const incident = await this.incidentsRepository.findOne({
      where: { id },
      relations: ['tunnel', 'creator'],
    });
    if (!incident) {
      throw new NotFoundException(`事件 #${id} 不存在`);
    }

    const timeline = await this.timelineService.findByIncidentId(id);

    const responseDuration = incident.closedAt
      ? Math.round((incident.closedAt.getTime() - incident.createdAt.getTime()) / 1000)
      : 0;

    return {
      id: incident.id,
      incidentNo: incident.incidentNo,
      tunnelName: incident.tunnel?.name || '',
      tunnelCode: incident.tunnel?.code || '',
      mileage: incident.mileage,
      type: incident.type,
      severity: incident.severity,
      source: incident.source,
      reporterName: incident.reporterName || '',
      description: incident.description,
      status: incident.status,
      creatorName: incident.creator?.displayName || '',
      createdAt: incident.createdAt,
      closedAt: incident.closedAt,
      responseDuration,
      timeline,
    };
  }

  async getStats() {
    this.logger.debug('Getting report statistics');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalIncidents, pendingIncidents, todayIncidents] = await Promise.all([
      this.incidentsRepository.count(),
      this.incidentsRepository.count({ where: { status: IncidentStatus.PENDING } }),
      this.incidentsRepository.count({ where: { createdAt: Between(today, new Date()) } }),
    ]);

    const resolvedIncidents = await this.incidentsRepository.count({
      where: { status: IncidentStatus.CLOSED },
    });

    const closedIncidents = await this.incidentsRepository.find({
      where: { status: IncidentStatus.CLOSED },
      select: ['createdAt', 'closedAt'],
    });

    let avgResponseTime = 0;
    if (closedIncidents.length > 0) {
      const totalDuration = closedIncidents.reduce((sum, inc) => {
        if (inc.closedAt) {
          return sum + (inc.closedAt.getTime() - inc.createdAt.getTime()) / 1000;
        }
        return sum;
      }, 0);
      avgResponseTime = Math.round(totalDuration / closedIncidents.length);
    }

    return {
      totalIncidents,
      pendingIncidents,
      resolvedIncidents,
      todayIncidents,
      avgResponseTime,
    };
  }
}
