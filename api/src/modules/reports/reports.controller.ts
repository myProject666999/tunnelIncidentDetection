import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ReportQueryDto) {
    this.logger.debug('GET /reports');
    return this.reportsService.findAll(query);
  }

  @Public()
  @Get('stats')
  getStats() {
    this.logger.debug('GET /reports/stats');
    return this.reportsService.getStats();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.debug(`GET /reports/${id}`);
    return this.reportsService.findOne(+id);
  }
}
