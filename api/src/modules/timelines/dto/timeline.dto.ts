import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTimelineDto {
  @IsNumber()
  incidentId: number;

  @IsString()
  event: string;

  @IsOptional()
  @IsNumber()
  operatorId?: number;

  @IsString()
  detail: string;
}
