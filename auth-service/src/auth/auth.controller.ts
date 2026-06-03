import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.login, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(req.user.id, dto);
  }
}