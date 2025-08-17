import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departments?: string[];
}
