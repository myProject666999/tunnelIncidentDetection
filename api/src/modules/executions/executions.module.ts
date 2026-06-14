import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { PlanExecution } from '../../entities/plan-execution.entity';
import { ActionExecution } from '../../entities/action-execution.entity';
import { Incident } from '../../entities/incident.entity';
import { Device } from '../../entities/device.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { TimelinesModule } from '../timelines/timelines.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanExecution, ActionExecution, Incident, Device]),
    TimelinesModule,
    PlansModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, EventsGateway],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
