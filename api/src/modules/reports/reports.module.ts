import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Incident } from '../../entities/incident.entity';
import { TimelinesModule } from '../timelines/timelines.module';

@Module({
  imports: [TypeOrmModule.forFeature([Incident]), TimelinesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
