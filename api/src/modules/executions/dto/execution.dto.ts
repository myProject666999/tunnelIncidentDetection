import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ActionExecutionStatus } from '../../../entities/action-execution.entity';

export class ExecutePlanDto {
  @IsNumber()
  incidentId: number;

  @IsOptional()
  @IsNumber()
  planId?: number;
}

export class AdjustActionDto {
  @IsEnum(ActionExecutionStatus)
  status: ActionExecutionStatus;

  @IsOptional()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsString()
  remark?: string;
}
