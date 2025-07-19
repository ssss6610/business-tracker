import { Injectable } from '@nestjs/common';
import { ImportedUserDto } from './dto/imported-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { normalizeUser } from './utils/normalize-user.util';
import { Role, UserType } from '../user/user.entity/user.entity';
import { parseEmployeeXls } from './parsers/bitrix.parser';
import { Express } from 'express';
@Injectable()
export class ImportService {
  constructor(private readonly userService: UserService) {}

  async previewBitrix(file: any): Promise<ImportedUserDto[]> {
  const raw = await parseEmployeeXls(file.path); // или file.buffer
  return raw.map(normalizeUser); // если normalizeUser есть
}

  async importAndCreateUsers(users: ImportedUserDto[]) {
    const created: CreateUserDto[] = [];

    const tempPassword = 'temp12345';

for (const raw of users) {
  const normalized = normalizeUser(raw);
  console.log('📦 Normalized:', normalized); // 👈 ДОБАВЬ ЭТО

  if (!normalized.email || !normalized.fullName) {
    console.warn('⛔ Пропущен (нет email или fullName):', normalized);
    continue;
  }

  const login = normalized.email.split('@')[0];
  const role: Role = Role.User;
  const userType: UserType = UserType.Employee;

  const dto: CreateUserDto = {
    login,
    email: normalized.email,
    password: tempPassword,
    role,
    userType,                // 👈 ОБЯЗАТЕЛЬНО если ты используешь это в сущности
    mustChangePassword: true,
  };

  console.log('🛠️ DTO:', dto); // 👈 ДОБАВЬ ЭТО

  try {
    await this.userService.create(dto);
    created.push(dto);
  } catch (e) {
    console.warn('❌ Ошибка при создании пользователя:', dto, e.message);
  }
}

    return {
      count: created.length,
      users: created,
    };
  }
}
