import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional} from 'class-validator';
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
  userType?: UserType;

  @IsOptional()
  mustChangePassword?: boolean; // 👈 Добавляем это поле
}
