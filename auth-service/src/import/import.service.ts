import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role, UserType } from '../user/user.entity/user.entity';
import { UserService } from '../user/user.service';
import { ImportedUserDto } from './dto/imported-user.dto';
import { parseEmployeeXls } from './parsers/bitrix.parser';
import { parseClientsCsv } from './parsers/clients.parser';
import { normalizeUser } from './utils/normalize-user.util';

@Injectable()
export class ImportService {
  constructor(private readonly userService: UserService) {}

  previewBitrix(file: Express.Multer.File): ImportedUserDto[] {
    const raw = parseEmployeeXls(file.path);
    return raw.map(normalizeUser);
  }

  async importAndCreateUsers(users: ImportedUserDto[]) {
    const created: CreateUserDto[] = [];
    const tempPassword = 'temp12345';

    for (const raw of users) {
      const normalized = normalizeUser(raw);

      if (!normalized.email || !normalized.fullName) {
        continue;
      }

      const dto: CreateUserDto = {
        login: normalized.email.split('@')[0],
        email: normalized.email,
        password: tempPassword,
        role: Role.User,
        userType: UserType.Employee,
        mustChangePassword: true,
      };

      try {
        await this.userService.create(dto);
        created.push(dto);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';

        console.warn('Ошибка при создании пользователя:', dto, message);
      }
    }

    return {
      count: created.length,
      users: created,
    };
  }

  async previewClients(file: Express.Multer.File): Promise<ImportedUserDto[]> {
    const raw = await parseClientsCsv(file.path);
    return raw.map(normalizeUser);
  }

  async importClients(users: ImportedUserDto[]) {
    const created: CreateUserDto[] = [];
    const tempPassword = 'temp12345';

    for (const raw of users) {
      const normalized = normalizeUser(raw);

      if (!normalized.email || !normalized.fullName) {
        continue;
      }

      const dto: CreateUserDto = {
        login: normalized.email.split('@')[0],
        email: normalized.email,
        password: tempPassword,
        role: Role.User,
        userType: UserType.Client,
        mustChangePassword: true,
      };

      try {
        await this.userService.create(dto);
        created.push(dto);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';

        console.warn('Ошибка при создании клиента:', dto, message);
      }
    }

    return {
      count: created.length,
      users: created,
    };
  }
}
