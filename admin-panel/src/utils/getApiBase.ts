// src/utils/getApiBase.ts
let cachedBase = '';

export const getApiBase = async (): Promise<string> => {
  if (cachedBase) return cachedBase;

  try {
    const res = await fetch('http://localhost:4000/api-info');
    const data = await res.json();
    cachedBase = `http://${data.host}:${data.port}`;
    return cachedBase;
  } catch (err) {
    console.error('❌ Не удалось получить API-инфо:', err);
    return 'http://localhost:3000'; // fallback для dev
  }
};
