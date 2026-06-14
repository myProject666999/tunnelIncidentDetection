import { Controller, Get, Post, Body, Patch, Param, Logger } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutePlanDto, AdjustActionDto } from './dto/execution.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('executions')
export class ExecutionsController {
  private readonly logger = new Logger(ExecutionsController.name);

  constructor(private readonly executionsService: ExecutionsService) {}

  @Post()
  executePlan(@Body() executePlanDto: ExecutePlanDto, @CurrentUser() user: CurrentUserPayload) {
    this.logger.debug(`POST /executions - incident: ${executePlanDto.incidentId}`);
    return this.executionsService.executePlan(executePlanDto, user.userId, user.username);
  }

  @Public()
  @Get('incident/:id')
  findByIncidentId(@Param('id') id: string) {
    this.logger.debug(`GET /executions/incident/${id}`);
    return this.executionsService.findByIncidentId(+id);
  }

  @Patch(':id/actions/:actionId')
  adjustAction(
    @Param('id') executionId: string,
    @Param('actionId') actionId: string,
    @Body() adjustDto: AdjustActionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.logger.debug(`PATCH /executions/${executionId}/actions/${actionId}`);
    return this.executionsService.adjustAction(+executionId, +actionId, adjustDto, user.userId, user.username);
  }
}
