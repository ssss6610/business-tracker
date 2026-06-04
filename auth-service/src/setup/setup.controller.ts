import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../roles/role.enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { SetupService } from './setup.service';

interface SetupDto {
  email: string;
  password: string;
}

interface AuthRequest {
  user?: {
    id: number;
    role: Role;
    setup?: boolean;
  };
}

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async setupAdmin(@Body() dto: SetupDto, @Request() req: AuthRequest) {
    if (!req.user || req.user.role !== Role.Admin) {
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
