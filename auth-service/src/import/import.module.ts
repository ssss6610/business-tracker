import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
