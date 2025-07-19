import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Threshold {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: 'cpu' | 'ram';

  @Column('float')
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
