import { Controller, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('login')
  async login(@Body() body: { login: string; password: string }) {
    console.log('🚀 Запрос в AuthController.login():', body);
    return this.authService.login(body.login, body.password);
  }
}