import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { DeviceStatus, DeviceType } from '../../../entities/device.entity';

export class UpdateDeviceDto {
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  content?: string;
}

export class DeviceQueryDto {
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsNumber()
  tunnelId?: number;
}
