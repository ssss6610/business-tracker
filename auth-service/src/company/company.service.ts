import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './company_settings.entity';
import { UpdateCompanySettingsDto } from './dto/update_company-settings.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanySettings)
    private readonly repo: Repository<CompanySettings>,
  ) {}

  async get(): Promise<CompanySettings> {
    let row = await this.repo.findOne({ where: { id: 1 } });
    if (!row) {
      row = this.repo.create({ id: 1, name: '', logoUrl: null });
      await this.repo.save(row);
    }
    return row;
  }

  async update(dto: UpdateCompanySettingsDto): Promise<CompanySettings> {
    const row = await this.get();
    row.name = dto.name.trim();
    row.logoUrl = dto.logoUrl ?? null;
    return this.repo.save(row);
  }
}
