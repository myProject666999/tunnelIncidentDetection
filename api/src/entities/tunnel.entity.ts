import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tunnel')
export class Tunnel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ comment: '隧道长度(米)' })
  length: number;

  @Column({ type: 'tinyint', default: 2, name: 'direction_count', comment: '方向数' })
  directionCount: number;

  @Column({ type: 'varchar', length: 200, name: 'start_location' })
  startLocation: string;

  @Column({ type: 'varchar', length: 200, name: 'end_location' })
  endLocation: string;
}
