import * as fs from 'fs';
import * as csv from 'csv-parser';
import { ImportedUserDto } from '../dto/imported-user.dto';

export async function parseClientsCsv(filePath: string): Promise<ImportedUserDto[]> {
  const users: ImportedUserDto[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const user: ImportedUserDto = {
          externalId: row.ID || row.Id || row['Contact ID'] || '',
          fullName: row.NAME || row['ФИО'] || row['Full Name'] || '',
          email: row.EMAIL || row['Email'] || row['E-Mail'] || '',
          position: row['Position'] || row['Должность'] || '',
          department: row['Company'] || row['Компания'] || '',
          source: 'bitrix24', // или 'bitrix24_clients', если хочешь различать
          userType: 'client', // 👈 обязательно!
        };
        users.push(user);
      })
      .on('end', () => resolve(users))
      .on('error', reject);
  });
}
