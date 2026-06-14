import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { Incident } from '../../entities/incident.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { TimelinesModule } from '../timelines/timelines.module';
import { PlansModule } from '../plans/plans.module';
import { ExecutionsModule } from '../executions/executions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    TimelinesModule,
    PlansModule,
    ExecutionsModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, EventsGateway],
  exports: [IncidentsService],
})
export class IncidentsModule {}
