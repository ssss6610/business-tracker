import { IsEmail, IsEnum, IsOptional, MinLength, IsString, IsInt, IsBoolean } from 'class-validator';
import { Role, UserType } from '../user.entity/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  login?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @IsOptional()
  @IsInt()
  trackerRoleId?: number | null;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}
