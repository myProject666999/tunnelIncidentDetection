import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { EmergencyPlan } from '../../entities/emergency-plan.entity';
import { PlanAction } from '../../entities/plan-action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmergencyPlan, PlanAction])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
