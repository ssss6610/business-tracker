import * as xlsx from 'xlsx';
import { ImportedUserDto } from '../dto/imported-user.dto';

export async function parseEmployeeXls(filePath: string): Promise<ImportedUserDto[]> {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  console.log('📄 Пример строки из XLS:', rows[0]);

  const users: ImportedUserDto[] = rows.map((row) => ({
    externalId: row.ID || '',
    fullName: row['Имя и фамилия'] || row['Сотрудник'] || '', // ✅
    email: row['E-Mail'] || '',                               // ✅
    position: '', // в файле нет → оставим пустым
    department: row['Подразделение'] || '',                   // ✅
    source: 'bitrix24',
  }));

  return users;
}
