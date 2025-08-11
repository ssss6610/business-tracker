// src/company/company.controller.ts
import {
  Body, Controller, Get, Put, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CompanyService } from './company.service';
import { UpdateCompanySettingsDto } from './dto/update_company-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadDir = join(process.cwd(), 'uploads', 'company-logos');

@Controller('admin/company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  update(@Body() dto: UpdateCompanySettingsDto) {
    return this.service.update(dto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (_req, file, cb) => cb(null, `logo_${Date.now()}${extname(file.originalname || '.png')}`),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = ['image/png','image/jpeg','image/jpg','image/svg+xml'].includes(file.mimetype);
      cb(ok ? null : new Error('INVALID_TYPE'), ok);
    },
  }))
  upload(@UploadedFile() file: any) {           // 👈 как в ImportController
    return { url: `/uploads/company-logos/${file.filename}` };
  }
}
