import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanExecution, ExecutionStatus } from '../../entities/plan-execution.entity';
import { ActionExecution, ActionExecutionStatus } from '../../entities/action-execution.entity';
import { ActionType } from '../../entities/plan-action.entity';
import { Device, DeviceType, DeviceStatus } from '../../entities/device.entity';
import { Incident, IncidentStatus } from '../../entities/incident.entity';
import { ExecutePlanDto, AdjustActionDto } from './dto/execution.dto';
import { EventsGateway } from '../../gateways/events.gateway';
import { IncidentTimelineService } from '../timelines/incident-timeline.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    @InjectRepository(PlanExecution)
    private executionsRepository: Repository<PlanExecution>,
    @InjectRepository(ActionExecution)
    private actionExecutionsRepository: Repository<ActionExecution>,
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    private eventsGateway: EventsGateway,
    private timelineService: IncidentTimelineService,
    private plansService: PlansService,
  ) {}

  async executePlan(executePlanDto: ExecutePlanDto, userId: number, username: string) {
    this.logger.debug(`Executing plan for incident #${executePlanDto.incidentId}`);

    const incident = await this.incidentsRepository.findOne({
      where: { id: executePlanDto.incidentId },
      relations: ['tunnel'],
    });
    if (!incident) {
      throw new NotFoundException(`事件 #${executePlanDto.incidentId} 不存在`);
    }

    let planId = executePlanDto.planId;
    if (!planId) {
      const plan = await this.plansService.findByTypeAndSeverity(
        incident.type as any,
        incident.severity as any,
      );
      if (!plan) {
        throw new BadRequestException(`未找到匹配的预案模板`);
      }
      planId = plan.id;
    }

    const plan = await this.plansService.findOne(planId);
    if (!plan) {
      throw new NotFoundException(`预案 #${planId} 不存在`);
    }

    const execution = this.executionsRepository.create({
      incidentId: executePlanDto.incidentId,
      planId: planId,
      status: ExecutionStatus.EXECUTING,
    });
    const savedExecution = await this.executionsRepository.save(execution);

    const actionExecutions = plan.actions.map((action: any) =>
      this.actionExecutionsRepository.create({
        executionId: savedExecution.id,
        actionId: action.id,
        status: ActionExecutionStatus.PENDING,
        parameters: action.parameters,
      }),
    );
    await this.actionExecutionsRepository.save(actionExecutions);

    await this.timelineService.create({
      incidentId: executePlanDto.incidentId,
      operatorId: userId,
      event: '预案触发',
      detail: `${username} 触发预案 [${plan.name}]，包含 ${plan.actions.length} 个处置动作`,
    });

    incident.status = IncidentStatus.RESPONDING;
    incident.planId = planId;
    await this.incidentsRepository.save(incident);

    this.executeActionsAsync(savedExecution.id, executePlanDto.incidentId, userId, username);

    return this.findByIncidentId(executePlanDto.incidentId);
  }

  private async executeActionsAsync(executionId: number, incidentId: number, userId: number, username: string) {
    const actionExecutions = await this.actionExecutionsRepository.find({
      where: { executionId },
      order: { id: 'ASC' },
    });

    for (const actionExec of actionExecutions) {
      try {
        await this.actionExecutionsRepository.update(actionExec.id, {
          status: ActionExecutionStatus.EXECUTING,
          startedAt: new Date(),
          operatorId: userId,
        });

        await this.performAction(actionExec.parameters, incidentId);

        await this.actionExecutionsRepository.update(actionExec.id, {
          status: ActionExecutionStatus.COMPLETED,
          completedAt: new Date(),
        });

        this.eventsGateway.emitExecutionProgress({
          executionId,
          actionId: actionExec.actionId,
          status: ActionExecutionStatus.COMPLETED,
        });
      } catch (error) {
        this.logger.error(`Action execution failed: ${error}`);
        await this.actionExecutionsRepository.update(actionExec.id, {
          status: ActionExecutionStatus.FAILED,
          completedAt: new Date(),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await this.executionsRepository.update(executionId, {
      status: ExecutionStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.eventsGateway.emitExecutionProgress({
      executionId,
      status: ExecutionStatus.COMPLETED,
    });
  }

  private async performAction(parameters: any, incidentId: number) {
    const incident = await this.incidentsRepository.findOne({ where: { id: incidentId } });
    if (!incident) return;

    const devices = await this.devicesRepository.find({
      where: { tunnelId: incident.tunnelId },
    });

    const actionType: ActionType = parameters?.actionType;

    switch (actionType) {
      case ActionType.LED_DISPLAY:
        const ledDevices = devices.filter((d) => d.type === DeviceType.LED_SCREEN);
        for (const led of ledDevices) {
          await this.devicesRepository.update(led.id, { content: parameters.text || '前方事故，慢行' });
        }
        break;

      case ActionType.LIGHT_FULL:
        const lightDevicesFull = devices.filter((d) => d.type === DeviceType.LIGHT_GROUP);
        for (const light of lightDevicesFull) {
          await this.devicesRepository.update(light.id, { content: JSON.stringify({ brightness: 100 }) });
        }
        break;

      case ActionType.LIGHT_ENHANCE:
        const lightDevicesEnhance = devices.filter((d) => d.type === DeviceType.LIGHT_GROUP);
        for (const light of lightDevicesEnhance) {
          await this.devicesRepository.update(light.id, { content: JSON.stringify({ brightness: parameters?.brightness || 80 }) });
        }
        break;

      case ActionType.TUNNEL_CLOSE:
        const barriersClose = devices.filter((d) => d.type === DeviceType.BARRIER);
        for (const barrier of barriersClose) {
          await this.devicesRepository.update(barrier.id, { content: JSON.stringify({ closed: true }) });
        }
        break;

      case ActionType.TUNNEL_OPEN:
        const barriersOpen = devices.filter((d) => d.type === DeviceType.BARRIER);
        for (const barrier of barriersOpen) {
          await this.devicesRepository.update(barrier.id, { content: JSON.stringify({ closed: false }) });
        }
        break;

      case ActionType.SPEED_LIMIT:
      case ActionType.NOTIFY_FIRE:
      case ActionType.NOTIFY_MEDICAL:
        break;
    }

    return true;
  }

  async findByIncidentId(incidentId: number) {
    this.logger.debug(`Finding execution for incident #${incidentId}`);
    const execution = await this.executionsRepository.findOne({
      where: { incidentId },
      relations: ['plan', 'actionExecutions', 'actionExecutions.action'],
      order: {
        startedAt: 'DESC',
        actionExecutions: { id: 'ASC' },
      },
    });

    if (!execution) {
      return null;
    }

    return {
      id: execution.id,
      incidentId: execution.incidentId,
      planId: execution.planId,
      planName: execution.plan?.name || '',
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      actions: execution.actionExecutions.map((ae) => ({
        id: ae.id,
        actionId: ae.actionId,
        step: ae.action?.step || 0,
        actionType: ae.action?.actionType || '',
        description: ae.action?.description || '',
        status: ae.status,
        parameters: ae.parameters,
        operatorId: ae.operatorId,
        remark: ae.remark,
        startedAt: ae.startedAt,
        completedAt: ae.completedAt,
      })),
    };
  }

  async adjustAction(executionId: number, actionId: number, adjustDto: AdjustActionDto, userId: number, username: string) {
    this.logger.debug(`Adjusting action #${actionId} in execution #${executionId}`);

    const actionExecution = await this.actionExecutionsRepository.findOne({
      where: { id: actionId, executionId },
      relations: ['action', 'execution'],
    });

    if (!actionExecution) {
      throw new NotFoundException(`动作执行记录不存在`);
    }

    if (adjustDto.status === ActionExecutionStatus.COMPLETED) {
      actionExecution.completedAt = new Date();
    }
    if (adjustDto.status === ActionExecutionStatus.EXECUTING) {
      actionExecution.startedAt = new Date();
    }

    actionExecution.status = adjustDto.status;
    if (adjustDto.parameters) {
      actionExecution.parameters = adjustDto.parameters;
    }
    if (adjustDto.remark) {
      actionExecution.remark = adjustDto.remark;
    }
    actionExecution.operatorId = userId;

    await this.actionExecutionsRepository.save(actionExecution);

    const statusMap: Record<string, string> = {
      [ActionExecutionStatus.COMPLETED]: '手动确认完成',
      [ActionExecutionStatus.SKIPPED]: '跳过',
      [ActionExecutionStatus.ADJUSTED]: '调整参数',
      [ActionExecutionStatus.FAILED]: '标记失败',
    };

    await this.timelineService.create({
      incidentId: actionExecution.execution.incidentId,
      operatorId: userId,
      event: '手动干预',
      detail: `${username} ${statusMap[adjustDto.status] || '调整'} 动作 [${actionExecution.action?.description}]${adjustDto.remark ? `：${adjustDto.remark}` : ''}`,
    });

    this.eventsGateway.emitExecutionProgress({
      executionId,
      actionId,
      status: adjustDto.status,
    });

    return this.findByIncidentId(actionExecution.execution.incidentId);
  }
}
