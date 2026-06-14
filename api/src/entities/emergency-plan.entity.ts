import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PlanAction } from './plan-action.entity';
import { IncidentType, Severity } from './incident.entity';

@Entity('emergency_plan')
export class EmergencyPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
    name: 'incident_type',
  })
  incidentType: IncidentType;

  @Column({
    type: 'enum',
    enum: Severity,
  })
  severity: Severity;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PlanAction, (action) => action.plan, { cascade: true })
  actions: PlanAction[];
}
