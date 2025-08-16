import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tracker_permissions')
export class TrackerPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // 'task.create', 'task.assign', ...

  @Column({ default: '' })
  name: string; // Человекочитаемо
}
