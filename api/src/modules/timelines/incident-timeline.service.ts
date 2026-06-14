import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentTimeline } from '../../entities/incident-timeline.entity';
import { CreateTimelineDto } from './dto/timeline.dto';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class IncidentTimelineService {
  private readonly logger = new Logger(IncidentTimelineService.name);

  constructor(
    @InjectRepository(IncidentTimeline)
    private timelineRepository: Repository<IncidentTimeline>,
    private eventsGateway: EventsGateway,
  ) {}

  async findByIncidentId(incidentId: number) {
    this.logger.debug(`Finding timelines for incident id: ${incidentId}`);
    const timelines = await this.timelineRepository.find({
      where: { incidentId },
      relations: ['operator'],
      order: { timestamp: 'ASC' },
    });

    return timelines.map((t) => ({
      id: t.id,
      incidentId: t.incidentId,
      timestamp: t.timestamp,
      event: t.event,
      operatorId: t.operatorId,
      operatorName: t.operator?.displayName || '',
      detail: t.detail,
    }));
  }

  async create(createTimelineDto: CreateTimelineDto) {
    this.logger.debug(`Creating timeline entry for incident #${createTimelineDto.incidentId}`);
    const timeline = this.timelineRepository.create(createTimelineDto);
    const saved = await this.timelineRepository.save(timeline);

    const result = await this.timelineRepository.findOne({
      where: { id: saved.id },
      relations: ['operator'],
    });

    const vo = {
      id: result.id,
      incidentId: result.incidentId,
      timestamp: result.timestamp,
      event: result.event,
      operatorId: result.operatorId,
      operatorName: result.operator?.displayName || '',
      detail: result.detail,
    };

    this.eventsGateway.emitTimelineNew(vo);
    return vo;
  }
}
