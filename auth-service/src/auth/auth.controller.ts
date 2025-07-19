import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { login: string; password: string }) {
    console.log('🚀 Запрос в AuthController.login():', body);
    return this.authService.login(body.login, body.password);
  }
}