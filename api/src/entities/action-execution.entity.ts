import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanExecution } from './plan-execution.entity';
import { PlanAction } from './plan-action.entity';
import { User } from './user.entity';

export enum ActionExecutionStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ADJUSTED = 'adjusted',
  FAILED = 'failed',
}

@Entity('action_execution')
export class ActionExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'execution_id' })
  executionId: number;

  @ManyToOne(() => PlanExecution, (execution) => execution.actionExecutions)
  @JoinColumn({ name: 'execution_id' })
  execution: PlanExecution;

  @Column({ name: 'action_id' })
  actionId: number;

  @ManyToOne(() => PlanAction)
  @JoinColumn({ name: 'action_id' })
  action: PlanAction;

  @Column({
    type: 'enum',
    enum: ActionExecutionStatus,
    default: ActionExecutionStatus.PENDING,
  })
  status: ActionExecutionStatus;

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, any>;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;
}
