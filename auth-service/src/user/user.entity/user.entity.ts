import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export enum UserType {
  Employee = 'employee',
  Client = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string; // 🆕 добавили логин

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'enum', enum: UserType, default: UserType.Employee })
  userType: UserType;

  @ManyToOne(() => TrackerRole, { nullable: true })
  trackerRole?: TrackerRole | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department?: string | null;

  @Column({ default: false })
  isInitialSetupCompleted: boolean;

  @Column({ default: false })
  mustChangePassword: boolean;
}
