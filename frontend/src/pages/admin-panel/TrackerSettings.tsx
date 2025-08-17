import { useEffect, useMemo, useState } from 'react';
import { getApiBase } from '../../utils/getApiBase';

type Permission = { id: number; code: string; name: string };
type Role = { id?: number; title: string; permissionIds: number[] };

const LS_KEY = 'trackerRolesLocal';

export default function TrackerSettings() {
  const [perms, setPerms] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<Role | null>(null);
  const [mode, setMode] = useState<'server' | 'local'>('server');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // начальная загрузка
  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const base = await getApiBase();
        const [p, r] = await Promise.all([
          fetch(`${base}/tracker/permissions`, { headers: { Authorization: `Bearer ${token}` } }).then(res => {
            if (!res.ok) throw new Error('perms');
            return res.json();
          }),
          fetch(`${base}/tracker/roles`, { headers: { Authorization: `Bearer ${token}` } }).then(res => {
            if (!res.ok) throw new Error('roles');
            return res.json();
          }),
        ]);

        setPerms(p);
        setRoles(
          r.map((x: any) => ({
            id: x.id,
            title: x.title,
            permissionIds: (x.permissions || []).map((p: any) => p.id),
          })),
        );
        setMode('server');
      } catch {
        // локальный режим
        setMode('local');
        const local = localStorage.getItem(LS_KEY);
        const parsed: Role[] = local ? JSON.parse(local) : [];
        setRoles(parsed);
        setPerms([
          { id: 1, code: 'task.create', name: 'Создавать задачи' },
          { id: 2, code: 'task.assign', name: 'Назначать исполнителей' },
          { id: 3, code: 'task.edit', name: 'Редактировать задачи' },
          { id: 4, code: 'task.view', name: 'Просматривать задачи' },
          { id: 5, code: 'task.comment', name: 'Комментировать' },
          { id: 6, code: 'board.manage', name: 'Управлять досками' },
          { id: 7, code: 'report.view', name: 'Просматривать отчёты' },
        ]);
      }
    })();
  }, []);

  // группировка прав по префиксу code (до точки)
  const grouped = useMemo(() => {
    const g: Record<string, Permission[]> = {};
    perms.forEach(p => {
      const key = p.code.split('.')[0];
      (g[key] ||= []).push(p);
    });
    return g;
  }, [perms]);

  // UI handlers
  const startCreate = () => setEditing({ title: '', permissionIds: [] });
  const startEdit = (r: Role) => setEditing({ ...r });
  const cancelEdit = () => setEditing(null);

  const togglePerm = (id: number) => {
    if (!editing) return;
    setEditing(prev =>
      prev
        ? {
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
              ? prev.permissionIds.filter(x => x !== id)
              : [...prev.permissionIds, id],
          }
        : prev,
    );
  };

  const saveRole = async () => {
    if (!editing || !editing.title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'server') {
        const token = localStorage.getItem('token');
        const base = await getApiBase();
        const res = await fetch(`${base}/tracker/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editing),
        });
        if (!res.ok) throw new Error('save failed');
        const saved = await res.json();
        const normalized: Role = {
          id: saved.id,
          title: saved.title,
          permissionIds: (saved.permissions || []).map((p: any) => p.id),
        };
        setRoles(prev => {
          const idx = prev.findIndex(x => x.id === normalized.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = normalized;
            return copy;
          }
          return [...prev, normalized];
        });
      } else {
        const withId: Role = editing.id ? editing : { ...editing, id: Date.now() };
        const next = (() => {
          const idx = roles.findIndex(r => r.id === withId.id);
          if (idx >= 0) {
            const copy = [...roles];
            copy[idx] = withId;
            return copy;
          }
          return [...roles, withId];
        })();
        setRoles(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      }
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || 'Не удалось сохранить роль');
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (r: Role) => {
    if (!confirm(`Удалить роль "${r.title}"?`)) return;
    setError(null);
    try {
      if (mode === 'server' && r.id) {
        const token = localStorage.getItem('token');
        const base = await getApiBase();
        const res = await fetch(`${base}/tracker/roles/${r.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('delete failed');
      } else {
        const next = roles.filter(x => x.id !== r.id);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      }
      setRoles(prev => prev.filter(x => x.id !== r.id));
    } catch (e: any) {
      setError(e?.message || 'Не удалось удалить роль');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Настройки трекера — роли</h1>
        <button onClick={startCreate} className="rounded bg-indigo-600 text-white px-4 py-2">
          Новая роль
        </button>
      </div>

      {mode === 'local' && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-2 text-amber-800 text-sm">
          Сервер недоступен — изменения сохраняются локально в этом браузере.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* список ролей */}
      <div className="grid gap-3 md:grid-cols-2">
        {roles.map(r => (
          <div key={r.id} className="rounded border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.title}</div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(r)} className="text-blue-600">Редактировать</button>
                <button onClick={() => deleteRole(r)} className="text-rose-600">Удалить</button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Права: {r.permissionIds.length ? r.permissionIds.length : 'нет'}
            </div>
          </div>
        ))}
      </div>

      {/* редактор роли */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded bg-white p-6">
            <div className="text-lg font-semibold mb-4">
              {editing.id ? 'Редактировать роль' : 'Новая роль'}
            </div>

            <label className="block text-sm font-medium">Название роли</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing!, title: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Например: Менеджер"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {Object.entries(grouped).map(([group, list]) => (
                <div key={group} className="rounded border p-3">
                  <div className="mb-2 font-medium text-sm">{group}</div>
                  <div className="space-y-2">
                    {list.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editing.permissionIds.includes(p.id)}
                          onChange={() => togglePerm(p.id)}
                        />
                        {p.name} <span className="text-gray-400">({p.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={cancelEdit} className="rounded border px-4 py-2">Отмена</button>
              <button
                onClick={saveRole}
                disabled={loading || !editing.title.trim()}
                className="rounded bg-indigo-600 px-4 py-2 text-white"
              >
                {loading ? 'Сохраняю…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
