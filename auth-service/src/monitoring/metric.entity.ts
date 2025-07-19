// src/monitoring/metric.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  cpu: number;

  @Column('float')
  ramUsed: number;

  @Column('float')
  ramTotal: number;

  @Column('float', { nullable: true })
  diskUsed?: number;

  @Column('float', { nullable: true })
  diskTotal?: number;

  @CreateDateColumn()
  timestamp: Date;
}
