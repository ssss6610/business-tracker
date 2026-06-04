import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { SetupService } from './setup.service';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async setupAdmin(
    @Body() dto: { email: string; password: string },
    @Request() req: any,
  ) {
    console.log('🧪 user from request:', req.user);

    if (!req.user || req.user.role !== Role.Admin) {
      console.warn('🛑 Доступ запрещён: нет роли admin');
      return {
        message: 'Недостаточно прав для настройки',
      };
    }

    const result = await this.setupService.setup(dto.email, dto.password);
    return {
      message: 'Настройка завершена',
      email: result.email,
    };
  }
}
