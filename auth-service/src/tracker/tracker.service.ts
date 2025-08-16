import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TrackerRole } from './tracker-role.entity';
import { TrackerPermission } from './tracker-permission.entity';
import { UpsertTrackerRoleDto } from './dto/upsert-role.dto';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(TrackerRole) private roles: Repository<TrackerRole>,
    @InjectRepository(TrackerPermission) private perms: Repository<TrackerPermission>,
  ) {}

  // Permissions
  listPermissions() { return this.perms.find(); }
  async seedPermissionsIfEmpty() {
    const count = await this.perms.count();
    if (count) return;
    const base = [
      { code: 'task.create', name: 'Создавать задачи' },
      { code: 'task.assign', name: 'Назначать исполнителей' },
      { code: 'task.edit',   name: 'Редактировать задачи' },
      { code: 'task.view',   name: 'Просматривать задачи' },
      { code: 'task.comment',name: 'Комментировать' },
      { code: 'board.manage',name: 'Управлять досками' },
      { code: 'report.view', name: 'Просматривать отчёты' },
    ];
    await this.perms.save(base);
  }

  // Roles
  listRoles() { return this.roles.find(); }

  async upsertRole(dto: UpsertTrackerRoleDto) {
    const permissions = dto.permissionIds?.length
      ? await this.perms.find({ where: { id: In(dto.permissionIds) } })
      : [];
    if (dto.id) {
      const role = await this.roles.findOne({ where: { id: dto.id } });
      if (!role) throw new NotFoundException('role not found');
      role.title = dto.title;
      role.permissions = permissions;
      return this.roles.save(role);
    }
    const role = this.roles.create({ title: dto.title, permissions });
    return this.roles.save(role);
  }

  async deleteRole(id: number) {
    await this.roles.delete(id);
    return { ok: true };
  }
}
