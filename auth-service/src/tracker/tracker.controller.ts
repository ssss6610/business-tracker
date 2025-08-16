import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrackerService } from './tracker.service';
import { UpsertTrackerRoleDto } from './dto/upsert-role.dto';

@Controller('tracker')
@UseGuards(JwtAuthGuard)
export class TrackerController {
  constructor(private readonly service: TrackerService) {}

  @Get('permissions') listPermissions() { return this.service.listPermissions(); }

  @Get('roles') listRoles() { return this.service.listRoles(); }

  @Post('roles') upsert(@Body() dto: UpsertTrackerRoleDto) {
    return this.service.upsertRole(dto);
  }

  @Delete('roles/:id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRole(id);
  }
}
