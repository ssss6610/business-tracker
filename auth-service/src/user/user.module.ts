import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity/user.entity'; // ⬅️ сущность пользователя
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ⬅️ регистрируем репозиторий
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // ⬅️ экспортируем, чтобы другие модули могли использовать
})
export class UserModule {}

