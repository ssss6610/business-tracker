import * as xlsx from 'xlsx';
import { ImportedUserDto } from '../dto/imported-user.dto';

interface BitrixRow {
  ID?: string;
  ['Имя и фамилия']?: string;
  Сотрудник?: string;
  ['E-Mail']?: string;
  Подразделение?: string;
}

export function parseEmployeeXls(filePath: string): ImportedUserDto[] {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<BitrixRow>(sheet);

  return rows.map((row) => ({
    externalId: row.ID || '',
    fullName: row['Имя и фамилия'] || row.Сотрудник || '',
    email: row['E-Mail'] || '',
    position: '',
    department: row.Подразделение || '',
    source: 'bitrix24',
    userType: 'employee',
  }));
}
