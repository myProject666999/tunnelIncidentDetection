import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tunnel } from './tunnel.entity';

export enum DeviceType {
  LED_SCREEN = 'led_screen',
  LIGHT_GROUP = 'light_group',
  BARRIER = 'barrier',
  CAMERA = 'camera',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MALFUNCTION = 'malfunction',
}

@Entity('device')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tunnel_id' })
  tunnelId: number;

  @ManyToOne(() => Tunnel)
  @JoinColumn({ name: 'tunnel_id' })
  tunnel: Tunnel;

  @Column({
    type: 'enum',
    enum: DeviceType,
  })
  type: DeviceType;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  @Column({ comment: '里程桩位置(米)' })
  mileage: number;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.ONLINE,
  })
  status: DeviceStatus;

  @Column({ type: 'text', nullable: true, comment: 'LED屏显示内容或设备参数' })
  content: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
