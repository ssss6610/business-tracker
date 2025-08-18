import axios from 'axios';
import { getApiBase } from './getApiBase';

// ---- AXIOS ----
export const api = axios.create();

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (!config.baseURL) config.baseURL = await getApiBase();
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try { localStorage.removeItem('token'); } catch {}
      window.dispatchEvent(new CustomEvent('auth:logout'));
      window.location.href = '/login';
      return;
    }
    throw error;
  }
);

// ---- FETCH ----
export async function authedFetch(input: string, init: RequestInit = {}) {
  const base = await getApiBase();
  const token = localStorage.getItem('token');
  const url = `${base}${input.startsWith('/') ? '' : '/'}${input}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    try { localStorage.removeItem('token'); } catch {}
    window.dispatchEvent(new CustomEvent('auth:logout'));
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}
