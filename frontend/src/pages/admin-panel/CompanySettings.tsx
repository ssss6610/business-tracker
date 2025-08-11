import { useEffect, useRef, useState } from 'react';
import { getApiBase } from '../../utils/getApiBase';
import { makeAbsoluteUrl } from '../../utils/assetUrl';
import LogoUploader from '../../components/LogoUploader';

type LogoFile = { file: File | null; preview: string | null };
type CompanySettingsDto = { name: string; logoUrl?: string | null };

type PersistenceMode = 'server' | 'local';
const LS_KEY = 'companySettings';

export default function CompanySettings() {
  const [form, setForm] = useState<CompanySettingsDto>({ name: '', logoUrl: null });
  const [logo, setLogo] = useState<LogoFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PersistenceMode>('server');

  const initialRef = useRef<CompanySettingsDto | null>(null);

  // Загрузка начальных настроек
  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = await getApiBase();
        const res = await fetch(`${baseUrl}/admin/company`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: CompanySettingsDto = await res.json();
        const name = data.name ?? '';
        const logoUrlAbs = await makeAbsoluteUrl(data.logoUrl ?? null);

        setForm({ name, logoUrl: logoUrlAbs });
        initialRef.current = { name, logoUrl: logoUrlAbs };
        setMode('server');
      } catch {
        // Фоллбэк в локальный режим
        setMode('local');
        try {
          const raw = localStorage.getItem(LS_KEY);
          const parsed = raw ? (JSON.parse(raw) as CompanySettingsDto) : { name: '', logoUrl: null };
          setForm({ name: parsed.name ?? '', logoUrl: parsed.logoUrl ?? null });
          initialRef.current = { name: parsed.name ?? '', logoUrl: parsed.logoUrl ?? null };
        } catch {
          initialRef.current = { name: '', logoUrl: null };
        }
      }
    })();
  }, []);

  const isNameValid = form.name.trim().length >= 2;
  const isDirty =
    (initialRef.current?.name ?? '') !== form.name ||
    (initialRef.current?.logoUrl ?? null) !== form.logoUrl ||
    !!logo?.file;

  // Сохранение
  const onSave = async () => {
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      let logoUrl: string | null = form.logoUrl ?? null;

      if (mode === 'server') {
        const token = localStorage.getItem('token');
        const baseUrl = await getApiBase();

        if (logo?.file) {
          const fd = new FormData();
          fd.append('file', logo.file);
          const up = await fetch(`${baseUrl}/admin/company/logo`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          if (!up.ok) throw new Error('Ошибка загрузки логотипа');
          const { url } = await up.json();
          logoUrl = url; // сервер вернул относительный путь /uploads/...
        }

        const res = await fetch(`${baseUrl}/admin/company`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: form.name.trim(), logoUrl }),
        });
        if (!res.ok) throw new Error('Не удалось сохранить настройки');
      } else {
        // локально храним dataURL превью, если выбрали новый файл
        if (logo?.file && logo.preview) {
          logoUrl = logo.preview;
        }
        const toSave: CompanySettingsDto = { name: form.name.trim(), logoUrl: logoUrl ?? null };
        localStorage.setItem(LS_KEY, JSON.stringify(toSave));
      }

      // Приводим ссылку к абсолютной (или оставляем dataURL/abs как есть)
      const absUrl = await makeAbsoluteUrl(logoUrl ?? null);

      setSaved(true);
      setLogo((prev) => (prev ? { ...prev, file: null } : prev));
      initialRef.current = { name: form.name.trim(), logoUrl: absUrl };
      setForm((f) => ({ ...f, logoUrl: absUrl }));

      // оповещаем лэйауты
      window.dispatchEvent(
        new CustomEvent<CompanySettingsDto>('company:updated', {
          detail: { name: form.name.trim(), logoUrl: absUrl },
        })
      );
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (!initialRef.current) return;
    setForm({ ...initialRef.current });
    setLogo(null);
    setSaved(false);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Настройки компании</h1>

      {mode === 'local' && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Сервер компании недоступен — настройки сохраняются локально в этом браузере.
          Поднимешь API — страница начнёт работать через сервер автоматически.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">Основные параметры, которые видны сотрудникам и клиентам.</p>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Название компании */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Название компании</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              type="text"
              placeholder="Например: Рога и копыта"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              aria-invalid={!isNameValid}
            />
            <p className="mt-2 text-xs text-gray-500">Минимум 2 символа. Используйте официальное наименование.</p>
            {!isNameValid && <p className="mt-1 text-xs text-rose-600">Введите корректное название.</p>}
          </div>

          {/* Логотип */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Логотип</label>
            <LogoUploader
              value={logo}
              setValue={setLogo}
              existingUrl={form.logoUrl ?? undefined}
              onRemoveExisting={() => setForm((f) => ({ ...f, logoUrl: null }))}
            />
            <p className="mt-2 text-xs text-gray-500">
              PNG/JPG/SVG до 2 МБ. Рекомендуемый размер 256×256.
              {mode === 'local' && ' В локальном режиме логотип хранится как превью (dataURL).'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <div className="text-sm">
            {saved && <span className="text-emerald-600">Сохранено ✔</span>}
            {error && <span className="text-rose-600">{error}</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              disabled={loading || !isDirty}
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={loading || !isNameValid || !isDirty}
              className={`rounded-lg px-4 py-2 text-sm text-white transition
                ${loading || !isNameValid || !isDirty ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              {loading ? 'Сохраняю…' : mode === 'server' ? 'Сохранить' : 'Сохранить (локально)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
