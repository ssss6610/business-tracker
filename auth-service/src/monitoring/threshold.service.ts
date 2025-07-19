// threshold.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Threshold } from './threshold.entity';

@Injectable()
export class ThresholdService {
  constructor(
    @InjectRepository(Threshold)
    private readonly repo: Repository<Threshold>,
  ) {}

  // Получить порог по типу
  async getThreshold(type: string) {
    return this.repo.findOne({ where: { type: type as 'cpu' | 'ram' } });
  }

  // Установить порог по типу
  async setThreshold(type: string, value: number) {
    const existing = await this.repo.findOne({ where: { type: type as 'cpu' | 'ram' } });

    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }

    return this.repo.save({ type: type as 'cpu' | 'ram', value });
  }

  // Удалить порог
  async deleteThreshold(type: string) {
    const existing = await this.repo.findOne({ where: { type: type as 'cpu' | 'ram' } });
    if (existing) {
      return this.repo.remove(existing);
    }
    return null;
  }

  // Получить все пороги
  async getAll() {
    return this.repo.find();
  }
}
