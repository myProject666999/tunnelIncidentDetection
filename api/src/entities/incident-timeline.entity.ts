import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incident } from './incident.entity';
import { User } from './user.entity';

@Entity('incident_timeline')
export class IncidentTimeline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'incident_id' })
  incidentId: number;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 100 })
  event: string;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'text' })
  detail: string;
}
