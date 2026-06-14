import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentType, Severity, IncidentSource, IncidentStatus } from '../../../entities/incident.entity';

export class CreateIncidentDto {
  @IsNumber()
  tunnelId: number;

  @IsNumber()
  mileage: number;

  @IsEnum(IncidentType)
  type: IncidentType;

  @IsEnum(Severity)
  severity: Severity;

  @IsEnum(IncidentSource)
  source: IncidentSource;

  @IsOptional()
  @IsString()
  reporterName?: string;

  @IsString()
  description: string;
}

export class UpdateIncidentStatusDto {
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}

export class IncidentQueryDto {
  @IsOptional()
  @IsEnum(IncidentType)
  type?: IncidentType;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsNumber()
  tunnelId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;
}
