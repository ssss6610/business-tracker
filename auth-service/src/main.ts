import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Разрешаем CORS для фронта
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // JSON-парсер и пайп валидации
  app.use(express.json());
  app.useGlobalPipes(new ValidationPipe());

  // 🔧 Создание временного администратора
  const userService = app.get(UserService);
  const existingAdmin = await userService.findAdmin();

  if (!existingAdmin) {
    const tempPassword = generatePassword();
    await userService.createAdmin(tempPassword);
    console.log(`\n🛡️  TEMP ADMIN CREATED:\nLogin:adm\nPassword: ${tempPassword}\n`);
  }

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Логируем все входящие запросы
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
  });

  await app.listen(3000);
}
bootstrap();

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}
