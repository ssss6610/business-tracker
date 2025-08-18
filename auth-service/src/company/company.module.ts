import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './company_settings.entity';
import { CompanyService } from './company.service';
import { CompanyController, PublicCompanyController } from './company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  providers: [CompanyService],
  controllers: [CompanyController, PublicCompanyController],
})
export class CompanyModule {}
