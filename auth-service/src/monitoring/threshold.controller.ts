// threshold.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ThresholdService } from './threshold.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../user/user.entity/user.entity';

@Controller('monitoring/thresholds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class ThresholdController {
  constructor(private readonly thresholdService: ThresholdService) {}

  @Get()
  getAll() {
    return this.thresholdService.getAll();
  }

  @Get(':type')
  getThreshold(@Param('type') type: string) {
    return this.thresholdService.getThreshold(type);
  }

  @Post()
  setThreshold(@Body() dto: { type: string; value: number }) {
    return this.thresholdService.setThreshold(dto.type, dto.value);
  }

  @Put(':type')
  updateThreshold(@Param('type') type: string, @Body() dto: { value: number }) {
    return this.thresholdService.setThreshold(type, dto.value);
  }

  @Delete(':type')
  deleteThreshold(@Param('type') type: string) {
    return this.thresholdService.deleteThreshold(type);
  }
}
