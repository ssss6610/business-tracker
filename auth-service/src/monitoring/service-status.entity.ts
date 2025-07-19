// src/monitoring/service-status.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ServiceStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string; // работает / не работает / недоступен

  @CreateDateColumn()
  timestamp: Date;
}
