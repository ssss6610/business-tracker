import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './company_settings.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
