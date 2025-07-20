// import/dto/imported-user.dto.ts

export class ImportedUserDto {
  externalId: string; // ID из сторонней системы (может быть строкой)
  fullName: string;   // Полное имя пользователя
  email: string;      // Email
  position?: string;  // Должность
  department?: string; // Отдел
  source: 'bitrix24' | 'trackstudio' | 'jira'; // Источник
  userType: 'employee' | 'client'; // 👈 добавили
}
