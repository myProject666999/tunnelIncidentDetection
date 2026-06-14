import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EmergencyPlan } from './emergency-plan.entity';

export enum ActionType {
  LED_DISPLAY = 'led_display',
  LIGHT_FULL = 'light_full',
  LIGHT_ENHANCE = 'light_enhance',
  TUNNEL_CLOSE = 'tunnel_close',
  TUNNEL_OPEN = 'tunnel_open',
  NOTIFY_FIRE = 'notify_fire',
  NOTIFY_MEDICAL = 'notify_medical',
  SPEED_LIMIT = 'speed_limit',
}

@Entity('plan_action')
export class PlanAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_id' })
  planId: number;

  @ManyToOne(() => EmergencyPlan, (plan) => plan.actions)
  @JoinColumn({ name: 'plan_id' })
  plan: EmergencyPlan;

  @Column()
  step: number;

  @Column({
    type: 'enum',
    enum: ActionType,
    name: 'action_type',
  })
  actionType: ActionType;

  @Column({ type: 'json' })
  parameters: Record<string, any>;

  @Column({ type: 'varchar', length: 200 })
  description: string;
}
