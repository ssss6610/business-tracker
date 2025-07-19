// monitoring/threshold-checker.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Threshold } from './threshold.entity';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';

@Injectable()
export class ThresholdCheckerService {
  private lastAlerts: Record<string, string> = {};

  constructor(
    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  async check(type: 'cpu' | 'ram', value: number) {
    const threshold = await this.thresholdRepo.findOne({ where: { type } });

    if (threshold && value > threshold.value) {
      const message = `${type.toUpperCase()} превышает порог ${threshold.value}%: ${value}%`;

      // предотвращаем дублирующий алерт
      if (this.lastAlerts[type] !== message) {
        this.lastAlerts[type] = message;

        await this.alertRepo.save({
          type,
          value,
          message,
          isRead: false, // можно указать явно, но и без него должно работать
        });
      }
    } else {
      // сбрасываем, если ниже порога
      this.lastAlerts[type] = '';
    }
  }
}
