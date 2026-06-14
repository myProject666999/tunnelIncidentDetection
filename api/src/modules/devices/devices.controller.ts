import { Controller, Get, Body, Patch, Param, Query, Logger } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto, DeviceQueryDto } from './dto/device.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('devices')
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);

  constructor(private readonly devicesService: DevicesService) {}

  @Public()
  @Get()
  findAll(@Query() query: DeviceQueryDto) {
    this.logger.debug('GET /devices');
    return this.devicesService.findAll(query);
  }

  @Public()
  @Get('tunnel/:id')
  findByTunnelId(@Param('id') id: string) {
    this.logger.debug(`GET /devices/tunnel/${id}`);
    return this.devicesService.findByTunnelId(+id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.debug(`GET /devices/${id}`);
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    this.logger.debug(`PATCH /devices/${id}`);
    return this.devicesService.update(+id, updateDeviceDto);
  }
}
