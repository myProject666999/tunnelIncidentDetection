import { Controller, Get, Param, Logger } from '@nestjs/common';
import { IncidentTimelineService } from './incident-timeline.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('timelines')
export class IncidentTimelineController {
  private readonly logger = new Logger(IncidentTimelineController.name);

  constructor(private readonly timelineService: IncidentTimelineService) {}

  @Public()
  @Get('incident/:id')
  findByIncidentId(@Param('id') id: string) {
    this.logger.debug(`GET /timelines/incident/${id}`);
    return this.timelineService.findByIncidentId(+id);
  }
}
