import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportedUserDto } from './dto/imported-user.dto';
import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('bitrix/preview')
  @UseInterceptors(FileInterceptor('file'))
  previewBitrix(@UploadedFile() file: Express.Multer.File) {
    return this.importService.previewBitrix(file);
  }

  @Post('bitrix/confirm')
  confirmBitrix(@Body() users: ImportedUserDto[]) {
    return this.importService.importAndCreateUsers(users);
  }

  @Post('clients/preview')
  @UseInterceptors(FileInterceptor('file'))
  previewClients(@UploadedFile() file: Express.Multer.File) {
    return this.importService.previewClients(file);
  }

  @Post('clients/confirm')
  confirmClients(@Body() users: ImportedUserDto[]) {
    return this.importService.importClients(users);
  }
}
