import { getApiBase } from './getApiBase';

export async function makeAbsoluteUrl(url: string | null | undefined) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = await getApiBase();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
