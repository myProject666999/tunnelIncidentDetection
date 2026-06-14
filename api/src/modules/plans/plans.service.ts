import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyPlan } from '../../entities/emergency-plan.entity';
import { PlanAction } from '../../entities/plan-action.entity';
import { IncidentType, Severity } from '../../entities/incident.entity';
import { CreatePlanDto, UpdatePlanDto, PlanQueryDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(EmergencyPlan)
    private plansRepository: Repository<EmergencyPlan>,
    @InjectRepository(PlanAction)
    private actionsRepository: Repository<PlanAction>,
  ) {}

  async findAll(query: PlanQueryDto) {
    this.logger.debug(`Finding all plans with query: ${JSON.stringify(query)}`);
    const where: any = {};
    if (query.incidentType) where.incidentType = query.incidentType;
    if (query.severity) where.severity = query.severity;
    if (query.enabled !== undefined) where.enabled = query.enabled;

    const plans = await this.plansRepository.find({
      where,
      relations: ['actions'],
      order: { id: 'ASC' },
    });

    return plans.map((p) => this.mapToVo(p));
  }

  async findOne(id: number) {
    this.logger.debug(`Finding plan with id: ${id}`);
    const plan = await this.plansRepository.findOne({
      where: { id },
      relations: ['actions'],
    });
    if (!plan) {
      throw new NotFoundException(`预案 #${id} 不存在`);
    }
    return this.mapToVo(plan);
  }

  async findByTypeAndSeverity(type: IncidentType, severity: Severity) {
    this.logger.debug(`Finding plan for type: ${type}, severity: ${severity}`);
    const plan = await this.plansRepository.findOne({
      where: {
        incidentType: type,
        severity,
        enabled: true,
      },
      relations: ['actions'],
    });
    return plan ? this.mapToVo(plan) : null;
  }

  async create(createPlanDto: CreatePlanDto) {
    this.logger.debug(`Creating plan with name: ${createPlanDto.name}`);

    const plan = this.plansRepository.create({
      name: createPlanDto.name,
      incidentType: createPlanDto.incidentType,
      severity: createPlanDto.severity,
      enabled: true,
    });

    const savedPlan = await this.plansRepository.save(plan);

    const actions = createPlanDto.actions.map((a) =>
      this.actionsRepository.create({
        planId: savedPlan.id,
        step: a.step,
        actionType: a.actionType,
        parameters: a.parameters || {},
        description: a.description,
      }),
    );

    await this.actionsRepository.save(actions);

    return this.findOne(savedPlan.id);
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    this.logger.debug(`Updating plan with id: ${id}`);
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`预案 #${id} 不存在`);
    }

    if (updatePlanDto.name) plan.name = updatePlanDto.name;
    if (updatePlanDto.incidentType) plan.incidentType = updatePlanDto.incidentType;
    if (updatePlanDto.severity) plan.severity = updatePlanDto.severity;
    if (updatePlanDto.enabled !== undefined) plan.enabled = updatePlanDto.enabled;

    await this.plansRepository.save(plan);

    if (updatePlanDto.actions) {
      await this.actionsRepository.delete({ planId: id });
      const actions = updatePlanDto.actions.map((a) =>
        this.actionsRepository.create({
          planId: id,
          step: a.step,
          actionType: a.actionType,
          parameters: a.parameters || {},
          description: a.description,
        }),
      );
      await this.actionsRepository.save(actions);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    this.logger.debug(`Removing plan with id: ${id}`);
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`预案 #${id} 不存在`);
    }
    await this.actionsRepository.delete({ planId: id });
    await this.plansRepository.remove(plan);
    return { message: '删除成功' };
  }

  private mapToVo(plan: EmergencyPlan) {
    return {
      id: plan.id,
      name: plan.name,
      incidentType: plan.incidentType,
      severity: plan.severity,
      enabled: plan.enabled,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      actions: plan.actions
        ? plan.actions
            .sort((a, b) => a.step - b.step)
            .map((a) => ({
              id: a.id,
              step: a.step,
              actionType: a.actionType,
              parameters: a.parameters,
              description: a.description,
            }))
        : [],
    };
  }
}
