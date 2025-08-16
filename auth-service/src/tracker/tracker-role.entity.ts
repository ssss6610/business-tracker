import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TrackerPermission } from './tracker-permission.entity';

@Entity('tracker_roles')
export class TrackerRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string; // 'Менеджер', 'Исполнитель'...

  @ManyToMany(() => TrackerPermission, { eager: true })
  @JoinTable({ name: 'tracker_role_permissions' })
  permissions: TrackerPermission[];
}
