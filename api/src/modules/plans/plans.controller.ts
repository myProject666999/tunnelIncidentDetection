import { Controller, Get, Post, Body, Put, Param, Delete, Query, Logger } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto, PlanQueryDto } from './dto/plan.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('plans')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(private readonly plansService: PlansService) {}

  @Public()
  @Get()
  findAll(@Query() query: PlanQueryDto) {
    this.logger.debug('GET /plans');
    return this.plansService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.debug(`GET /plans/${id}`);
    return this.plansService.findOne(+id);
  }

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    this.logger.debug(`POST /plans - name: ${createPlanDto.name}`);
    return this.plansService.create(createPlanDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    this.logger.debug(`PUT /plans/${id}`);
    return this.plansService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.debug(`DELETE /plans/${id}`);
    return this.plansService.remove(+id);
  }
}
