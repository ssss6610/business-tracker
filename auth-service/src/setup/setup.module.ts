import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { UserModule } from '../user/user.module'; // ✅ импортируем UserModule

@Module({
  imports: [UserModule], // ✅ добавляем сюда
  controllers: [SetupController],
  providers: [SetupService]
})
export class SetupModule {}
