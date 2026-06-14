import { Controller, Get, Post, Body, Patch, Param, Query, Logger } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentStatusDto, IncidentQueryDto } from './dto/incident.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ExecutionsService } from '../executions/executions.service';

@Controller('incidents')
export class IncidentsController {
  private readonly logger = new Logger(IncidentsController.name);

  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly executionsService: ExecutionsService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: IncidentQueryDto) {
    this.logger.debug('GET /incidents');
    return this.incidentsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.debug(`GET /incidents/${id}`);
    return this.incidentsService.findOne(+id);
  }

  @Post()
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.logger.debug(`POST /incidents - type: ${createIncidentDto.type}`);
    const incident = await this.incidentsService.create(
      createIncidentDto,
      user.userId,
      user.username,
    );

    try {
      await this.executionsService.executePlan(
        { incidentId: incident.id },
        user.userId,
        user.username,
      );
      this.logger.debug(`Auto-executed plan for incident #${incident.id}`);
    } catch (error) {
      this.logger.warn(`Failed to auto-execute plan for incident #${incident.id}: ${error.message}`);
    }

    return this.incidentsService.findOne(incident.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncidentStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.logger.debug(`PATCH /incidents/${id}/status`);
    return this.incidentsService.updateStatus(+id, updateDto, user.userId, user.username);
  }

  @Public()
  @Post('simulate')
  async simulate(@Body() createIncidentDto: CreateIncidentDto) {
    this.logger.debug('POST /incidents/simulate - video detection simulation');
    const result = await this.incidentsService.simulateVideoDetection(createIncidentDto);

    try {
      await this.executionsService.executePlan(
        { incidentId: result.id },
        1,
        '视频检测系统',
      );
      this.logger.debug(`Auto-executed plan for simulated incident #${result.id}`);
    } catch (error) {
      this.logger.warn(`Failed to auto-execute plan for simulated incident #${result.id}: ${error.message}`);
    }

    return this.incidentsService.findOne(result.id);
  }
}
