import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tunnel } from './tunnel.entity';
import { User } from './user.entity';

export enum IncidentType {
  BREAKDOWN = 'breakdown',
  REAR_END = 'rear_end',
  INTRUSION = 'intrusion',
  FIRE = 'fire',
  WRONG_WAY = 'wrong_way',
  DEBRIS = 'debris',
}

export enum Severity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum IncidentSource {
  MANUAL = 'manual',
  VIDEO_DETECTION = 'video_detection',
  PUBLIC_REPORT = 'public_report',
}

export enum IncidentStatus {
  PENDING = 'pending',
  RESPONDING = 'responding',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('incident')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'incident_no', unique: true })
  incidentNo: string;

  @Column({ name: 'tunnel_id' })
  tunnelId: number;

  @ManyToOne(() => Tunnel)
  @JoinColumn({ name: 'tunnel_id' })
  tunnel: Tunnel;

  @Column({ comment: '里程桩位置(米)' })
  mileage: number;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: Severity,
  })
  severity: Severity;

  @Column({
    type: 'enum',
    enum: IncidentSource,
  })
  source: IncidentSource;

  @Column({ type: 'varchar', length: 50, name: 'reporter_name', nullable: true })
  reporterName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.PENDING,
  })
  status: IncidentStatus;

  @Column({ name: 'plan_id', nullable: true })
  planId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'datetime', nullable: true })
  closedAt: Date;
}
