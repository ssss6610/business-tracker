import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertTrackerRoleDto {
  @IsOptional() id?: number;
  @IsString() @MinLength(2) title!: string;
  @IsArray() permissionIds!: number[];
}
