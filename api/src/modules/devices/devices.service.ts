import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceStatus, DeviceType } from '../../entities/device.entity';
import { UpdateDeviceDto, DeviceQueryDto } from './dto/device.dto';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query: DeviceQueryDto) {
    this.logger.debug(`Finding all devices with query: ${JSON.stringify(query)}`);
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.tunnelId) where.tunnelId = query.tunnelId;

    return this.devicesRepository.find({
      where,
      relations: ['tunnel'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    this.logger.debug(`Finding device with id: ${id}`);
    const device = await this.devicesRepository.findOne({
      where: { id },
      relations: ['tunnel'],
    });
    if (!device) {
      throw new NotFoundException(`设备 #${id} 不存在`);
    }
    return device;
  }

  async findByTunnelId(tunnelId: number) {
    this.logger.debug(`Finding devices for tunnel id: ${tunnelId}`);
    return this.devicesRepository.find({
      where: { tunnelId },
      order: { mileage: 'ASC' },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    this.logger.debug(`Updating device with id: ${id}`);
    const device = await this.findOne(id);
    await this.devicesRepository.update(id, updateDeviceDto);
    const updated = await this.findOne(id);
    this.eventsGateway.emitDeviceStatus(updated);
    return updated;
  }
}
