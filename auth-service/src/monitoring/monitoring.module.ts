import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { Alert } from './alert.entity';
import { ServiceStatus } from './service-status.entity';
import { Threshold } from './threshold.entity';
import { ThresholdController } from './threshold.controller';
import { ThresholdService } from './threshold.service';
import { ThresholdCheckerService } from './threshold-checker.service';
import { AlertController } from './alert.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Metric, Alert, ServiceStatus, Threshold])],
  controllers: [MonitoringController, ThresholdController, AlertController],
  providers: [MonitoringService, ThresholdService, ThresholdCheckerService],
})
export class MonitoringModule {}