import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

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
      setup: !user.isInitialSetupCompleted,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
