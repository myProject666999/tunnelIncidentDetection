import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Incident } from './incident.entity';
import { EmergencyPlan } from './emergency-plan.entity';
import { ActionExecution } from './action-execution.entity';

export enum ExecutionStatus {
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}

@Entity('plan_execution')
export class PlanExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'incident_id' })
  incidentId: number;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @Column({ name: 'plan_id' })
  planId: number;

  @ManyToOne(() => EmergencyPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: EmergencyPlan;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.EXECUTING,
  })
  status: ExecutionStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @OneToMany(() => ActionExecution, (action) => action.execution)
  actionExecutions: ActionExecution[];
}
