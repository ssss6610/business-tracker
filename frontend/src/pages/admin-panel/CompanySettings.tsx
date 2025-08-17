import { useEffect, useRef, useState } from 'react';
import { getApiBase } from '../../utils/getApiBase';
import { makeAbsoluteUrl } from '../../utils/assetUrl';
import LogoUploader from '../../components/LogoUploader';

type LogoFile = { file: File | null; preview: string | null };
type CompanySettingsDto = {
  name: string;
  logoUrl?: string | null;
  departments?: string[];
};

type PersistenceMode = 'server' | 'local';
const LS_KEY = 'companySettings';

export default function CompanySettings() {
  const [form, setForm] = useState<CompanySettingsDto>({ name: '', logoUrl: null, departments: [] });
  const [logo, setLogo] = useState<LogoFile | null>(null);
  const [deptInput, setDeptInput] = useState(''); // поле ввода отдела

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PersistenceMode>('server');

  const initialRef = useRef<CompanySettingsDto | null>(null);

  // ===== загрузка =====
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
        const departments = Array.isArray(data.departments) ? data.departments : [];

        const normalized = { name, logoUrl: logoUrlAbs, departments };
        setForm(normalized);
        initialRef.current = normalized;
        setMode('server');
      } catch {
        // локальный режим
        setMode('local');
        try {
          const raw = localStorage.getItem(LS_KEY);
          const parsed = raw ? (JSON.parse(raw) as CompanySettingsDto) : { name: '', logoUrl: null, departments: [] };
          const normalized = {
            name: parsed.name ?? '',
            logoUrl: parsed.logoUrl ?? null,
            departments: Array.isArray(parsed.departments) ? parsed.departments : [],
          };
          setForm(normalized);
          initialRef.current = normalized;
        } catch {
          initialRef.current = { name: '', logoUrl: null, departments: [] };
        }
      }
    })();
  }, []);

  const isNameValid = form.name.trim().length >= 2;
  const isDirty =
    (initialRef.current?.name ?? '') !== form.name ||
    (initialRef.current?.logoUrl ?? null) !== form.logoUrl ||
    JSON.stringify(initialRef.current?.departments ?? []) !== JSON.stringify(form.departments ?? []) ||
    !!logo?.file;

  // ===== отделы — helpers =====
  const addDepartment = () => {
    const v = deptInput.trim();
    if (!v) return;
    if (v.length > 100) {
      setError('Название отдела слишком длинное (до 100 символов).');
      return;
    }
    // уникальность без учёта регистра
    const exists = (form.departments ?? []).some((d) => d.toLowerCase() === v.toLowerCase());
    if (exists) {
      setError('Такой отдел уже есть.');
      return;
    }
    setForm((f) => ({ ...f, departments: [...(f.departments ?? []), v] }));
    setDeptInput('');
    setSaved(false);
  };

  const removeDepartment = (idx: number) => {
    setForm((f) => ({
      ...f,
      departments: (f.departments ?? []).filter((_, i) => i !== idx),
    }));
    setSaved(false);
  };

  const renameDepartment = (idx: number, value: string) => {
    const v = value.trim();
    setForm((f) => {
      const arr = [...(f.departments ?? [])];
      arr[idx] = v;
      return { ...f, departments: arr };
    });
    setSaved(false);
  };

  // ===== сохранение =====
  const onSave = async () => {
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      let logoUrl = form.logoUrl ?? null;

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
          logoUrl = url; // относительный путь от бэка
        }

        // фильтр отделов: trim, убираем пустые/дубликаты
        const cleaned = Array.from(
          new Set((form.departments ?? []).map((d) => d.trim()).filter(Boolean)),
        );

        const res = await fetch(`${baseUrl}/admin/company`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: form.name.trim(),
            logoUrl,
            departments: cleaned,
          } as CompanySettingsDto),
        });
        if (!res.ok) throw new Error('Не удалось сохранить настройки');
      } else {
        // локальный режим
        if (logo?.file && logo.preview) {
          logoUrl = logo.preview; // dataURL
        }
        const cleaned = Array.from(
          new Set((form.departments ?? []).map((d) => d.trim()).filter(Boolean)),
        );
        const toSave: CompanySettingsDto = {
          name: form.name.trim(),
          logoUrl: logoUrl ?? null,
          departments: cleaned,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(toSave));
      }

      // нормализуем URL лого до абсолютного
      const absUrl = await makeAbsoluteUrl(logoUrl ?? null);

      setSaved(true);
      setLogo((prev) => (prev ? { ...prev, file: null } : prev));
      const normalized: CompanySettingsDto = {
        name: form.name.trim(),
        logoUrl: absUrl,
        departments: Array.from(new Set((form.departments ?? []).map((d) => d.trim()).filter(Boolean))),
      };
      initialRef.current = normalized;
      setForm(normalized);

      // оповестим лэйауты
      window.dispatchEvent(
        new CustomEvent<CompanySettingsDto>('company:updated', {
          detail: normalized,
        }),
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
    setDeptInput('');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Персонализация</h1>

      {mode === 'local' && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Сервер недоступен — настройки сохраняются локально в этом браузере.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">Название, логотип и структура отделов.</p>
        </div>

        {/* Основные поля */}
        <div className="space-y-6 px-6 py-6">
          {/* Название компании */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Название компании</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              type="text"
              placeholder="Например: ПрограмБанк"
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

          {/* Отделы */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Отделы</label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDepartment();
                  }
                }}
                placeholder="Например: Продажи"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={addDepartment}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Добавить
              </button>
            </div>

            {form.departments && form.departments.length > 0 ? (
              <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
                {form.departments.map((d, idx) => (
                  <li key={`${d}-${idx}`} className="flex items-center gap-2 px-3 py-2">
                    <input
                      className="flex-1 rounded border border-gray-300 px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      value={d}
                      onChange={(e) => renameDepartment(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeDepartment(idx)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                      aria-label={`Удалить отдел ${d}`}
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Пока нет отделов. Добавьте первый в поле выше.</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Эти отделы будут доступны в админ-таблице пользователей и других сервисах.
            </p>
          </div>
        </div>

        {/* Footer */}
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
