import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../user/user.service';
import { Role } from '../user/user.entity/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(login: string, password: string) {
    const user = await this.userService.findByLogin(login);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(login: string, password: string) {
    const user = await this.validateUser(login, password);

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      setup:
        user.role === Role.Admin
          ? !user.isInitialSetupCompleted
          : user.mustChangePassword,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Старый пароль неверный');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
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
}