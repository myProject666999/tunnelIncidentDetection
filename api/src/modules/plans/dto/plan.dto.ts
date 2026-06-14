import { IsEnum, IsOptional, IsString, IsArray, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentType, Severity } from '../../../entities/incident.entity';
import { ActionType } from '../../../entities/plan-action.entity';

export class CreatePlanActionDto {
  @IsNumber()
  step: number;

  @IsEnum(ActionType)
  actionType: ActionType;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsString()
  description: string;
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @IsEnum(Severity)
  severity: Severity;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanActionDto)
  actions: CreatePlanActionDto[];
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanActionDto)
  actions?: CreatePlanActionDto[];
}

export class PlanQueryDto {
  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  enabled?: boolean;
}
