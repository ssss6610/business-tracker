import { getApiBase } from './getApiBase';

export async function makeAbsoluteUrl(url?: string | null) {
  if (!url) return url ?? null;
  if (url.startsWith('http') || url.startsWith('data:')) return url; // уже пригодно для <img>
  const base = await getApiBase();
  return `${base}${url}`;
}
