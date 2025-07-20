import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportedUserDto } from './dto/imported-user.dto';
import { ImportService } from './import.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads', // 🔁 Папка, куда будет сохраняться CSV
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${unique}${ext}`);
    },
  }),
}))

  @Post('bitrix')
  async uploadBitrix(@UploadedFile() file: any) {
    return this.importService.previewBitrix(file);
  }

  @Post('bitrix/confirm')
  async confirmBitrixImport(@Body() users: ImportedUserDto[]) {
    return await this.importService.importAndCreateUsers(users);
  }
  @Post('clients')
  @UseInterceptors(FileInterceptor('file'))
  async previewClients(@UploadedFile() file: any) {
  return this.importService.previewClients(file);
}

  @Post('clients/confirm')
  async confirmClients(@Body() users: ImportedUserDto[]) {
  return this.importService.importClients(users);
}

}
