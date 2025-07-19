import { Controller, Get, Patch, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';

@Controller('monitoring/alerts')
export class AlertController {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  @Get()
  async getAll() {
    return this.alertRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  @Patch('mark-read')
  async markAllRead() {
    await this.alertRepo.update({ isRead: false }, { isRead: true });
    return { success: true };
  }

  @Delete('clear')
  async clearAll() {
    await this.alertRepo.clear();
    return { success: true };
  }
}
