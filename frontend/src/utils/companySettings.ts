import { getApiBase } from './getApiBase';
import { makeAbsoluteUrl } from './assetUrl';

export type CompanySettings = { name: string; logoUrl?: string | null };

export async function fetchCompanySettings(): Promise<CompanySettings> {
  try {
    const token = localStorage.getItem('token');
    const baseUrl = await getApiBase();
    const res = await fetch(`${baseUrl}/admin/company`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('http');
    const data = await res.json();
    return {
      name: data?.name ?? '',
      logoUrl: await makeAbsoluteUrl(data?.logoUrl ?? null),
    };
  } catch {
    const raw = localStorage.getItem('companySettings');
    return raw ? JSON.parse(raw) : { name: '', logoUrl: null };
  }
}
