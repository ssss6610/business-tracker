import { makeAbsoluteUrl } from './assetUrl';
import { getApiBase } from './getApiBase';

export type Branding = { name: string; logoUrl: string | null };

export const DEFAULT_BRANDING: Branding = {
  name: 'Добро пожаловать',
  logoUrl: null,
};

export async function loadBranding(): Promise<Branding> {
  // 1) публичный серверный эндпоинт
  try {
    const base = await getApiBase();
    const res = await fetch(`${base}/public/company`);
    if (res.ok) {
      const data = await res.json();
      return {
        name: data?.name || DEFAULT_BRANDING.name,
        logoUrl: await makeAbsoluteUrl(data?.logoUrl ?? null),
      };
    }
  } catch {}

  // 2) фоллбэк локально
  try {
    const raw = localStorage.getItem('companySettings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed?.name || DEFAULT_BRANDING.name,
        logoUrl: parsed?.logoUrl || null,
      };
    }
  } catch {}

  return DEFAULT_BRANDING;
}
