import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SetupModule } from './setup/setup.module';
import { ImportModule } from './import/import.module';
import { CompanyModule } from './company/company.module';
import { TrackerModule } from './tracker/tracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: +config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // в проде отключать
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    SetupModule,
    MonitoringModule,
    ImportModule,
    CompanyModule,
    TrackerModule,
  ],
})
export class AppModule {}
