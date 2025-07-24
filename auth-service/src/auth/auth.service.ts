import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../user/user.entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(login: string, pass: string) {
    console.log('🧪 Проверка логина:', login);
    const user = await this.userService.findByLogin(login);
    console.log('🔍 Найден пользователь:', user);

    if (!user) {
      console.warn('❌ Пользователь не найден');
      return null;
    }

    const match = await bcrypt.compare(pass, user.password);
    console.log('🔐 Совпадение пароля:', match);

    if (!match) {
      console.warn('❌ Пароль не совпадает');
      return null;
    }

    return user;
  }

  async login(login: string, password: string) {
    console.log('⚡ login() вызван с login:', login);
    const user = await this.validateUser(login, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      role: user.role,
      setup: user.role === Role.Admin
        ? !user.isInitialSetupCompleted
        : user.mustChangePassword,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Старый пароль неверный');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashed;
    user.mustChangePassword = false;
    user.isInitialSetupCompleted = true;

    await this.userService.save(user);

    const payload = {
      sub: user.id,
      role: user.role,
      setup: false,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} // ← ← ← вот эта скобка была пропущена
