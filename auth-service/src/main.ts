import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 ДОБАВЬ
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { json, urlencoded } from 'express';
import getPort from 'get-port';
import { join } from 'path';

async function bootstrap() {
  const port = await getPort({
    port: Array.from({ length: 100 }, (_, i) => 3000 + i),
  });

  // мини‑сервер для /api-info
  const infoApp = express();
  infoApp.get('/api-info', (_, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ port, host: 'localhost' });
  });
  infoApp.listen(4000, () => {
    console.log(`ℹ️  API Info: http://localhost:4000/api-info`);
  });

  // 👇 типизируем как NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // раздача статиков из корневого uploads/
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  const userService = app.get(UserService);
  const existingAdmin = await userService.findAdmin();
  if (!existingAdmin) {
    const tempPassword = generatePassword();
    await userService.createAdmin(tempPassword);
    console.log(`🛡️ TEMP ADMIN CREATED:\nLogin:adm\nPassword: ${tempPassword}`);
  }

  app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
  });

  await app.listen(port);
  console.log(`🚀 Server started on http://localhost:${port}`);
}

bootstrap();

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}
