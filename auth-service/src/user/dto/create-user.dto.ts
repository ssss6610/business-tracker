import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Role, UserType } from '../user.entity/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  login: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType; // по умолчанию Employee — выставляем в сервисе

  @IsOptional()
  @IsInt()
  trackerRoleId?: number | null; // ссылка на роль в трекере

  @IsOptional()
  @IsString()
  department?: string | null; // отдел

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean; // 👈 для принудительной смены
}
