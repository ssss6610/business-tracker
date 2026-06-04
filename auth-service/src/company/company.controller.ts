import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyService } from './company.service';
import { UpdateCompanySettingsDto } from './dto/update_company-settings.dto';

const uploadDir = join(process.cwd(), 'uploads', 'company-logos');

@UseGuards(JwtAuthGuard)
@Controller('admin/company')
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (
          _req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const name = `logo_${Date.now()}${extname(
            file.originalname || '.png',
          )}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const allowedTypes = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/svg+xml',
        ];

        const isAllowed = allowedTypes.includes(file.mimetype);
        cb(isAllowed ? null : new Error('INVALID_TYPE'), isAllowed);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/company-logos/${file.filename}` };
  }
}

@Controller('public/company')
export class PublicCompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  async getPublic() {
    const settings = await this.service.get();

    return {
      name: settings.name || 'OpenWorkspace',
      logoUrl: settings.logoUrl || null,
      departments: settings.departments ?? [],
    };
  }
}
