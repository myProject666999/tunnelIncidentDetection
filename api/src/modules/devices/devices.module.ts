import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from '../../entities/device.entity';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DevicesController],
  providers: [DevicesService, EventsGateway],
  exports: [DevicesService],
})
export class DevicesModule {}
