import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '../user/user.entity/user.entity';

@Injectable()
export class SetupService {
  constructor(private readonly userService: UserService) {}

  async setup(newEmail: string, newPassword: string) {
    const admin = await this.userService.findAdmin();

    if (!admin) {
      throw new Error('Администратор не найден');
    }

    // Хешируем новый пароль
    const hashed = await bcrypt.hash(newPassword, 10);

    // Обновляем пользователя полностью
    admin.email = newEmail;
    admin.password = hashed;
    admin.role = Role.Admin; // ❗ Гарантируем роль
    admin.isInitialSetupCompleted = true;

    return this.userService.save(admin);
  }
}
