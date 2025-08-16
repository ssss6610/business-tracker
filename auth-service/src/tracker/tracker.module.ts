import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerRole } from './tracker-role.entity';
import { TrackerPermission } from './tracker-permission.entity';
import { TrackerService } from './tracker.service';
import { TrackerController } from './tracker.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrackerRole, TrackerPermission])],
  providers: [TrackerService],
  controllers: [TrackerController],
})
export class TrackerModule implements OnModuleInit {
  constructor(private readonly service: TrackerService) {}
  async onModuleInit() { await this.service.seedPermissionsIfEmpty(); }
}
