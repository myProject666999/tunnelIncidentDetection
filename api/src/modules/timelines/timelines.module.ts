import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentTimelineService } from './incident-timeline.service';
import { IncidentTimelineController } from './incident-timeline.controller';
import { IncidentTimeline } from '../../entities/incident-timeline.entity';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([IncidentTimeline])],
  controllers: [IncidentTimelineController],
  providers: [IncidentTimelineService, EventsGateway],
  exports: [IncidentTimelineService],
})
export class TimelinesModule {}
