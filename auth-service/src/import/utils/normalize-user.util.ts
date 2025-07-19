// import/utils/normalize-user.util.ts
import { ImportedUserDto } from '../dto/imported-user.dto';

export function normalizeUser(user: ImportedUserDto): ImportedUserDto {
  return {
    ...user,
    email: user.email.trim().toLowerCase(),
    fullName: user.fullName.trim(),
  };
}
