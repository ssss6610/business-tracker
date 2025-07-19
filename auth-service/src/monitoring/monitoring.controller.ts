// monitoring.controller.ts
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../user/user.entity/user.entity';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  @Roles(Role.Admin)
  async getStats() {
    return this.monitoringService.getStats();
  }

  @Get('history')
  @Roles(Role.Admin)
  async getHistory() {
    return this.monitoringService.getHistory();
  }
  @Get('alerts')
  @Roles(Role.Admin)
  getAlerts() {
    return this.monitoringService.getAlerts();
  }
  @Get('services/:name/history')
  @Roles(Role.Admin)
  getServiceHistory(@Param('name') name: string) {
   return this.monitoringService.getServiceHistory(name);
  }
  @Get('top-processes')
@ Roles(Role.Admin)
 getTopProcesses() {
  return this.monitoringService.getTopProcesses();
}
}
