import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import { FaUserEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import { MdEdit, MdCancel } from "react-icons/md";
import { SiBraintree, SiJira, SiApache } from "react-icons/si";
import { getApiBase } from '../../utils/getApiBase';

ReactModal.setAppElement('#root');

type BaseRole = 'admin' | 'user';
type UserType = 'employee' | 'client';

interface User {
  id: number;
  login: string;
  email: string;
  role: BaseRole;
  // новые поля
  userType: UserType;
  trackerRoleId?: number | null;
  trackerRoleTitle?: string | null; // опционально, если бэк отдаёт
  department?: string | null;
}

interface TrackerRole { id: number; title: string; }

interface ImportedUserDto {
  fullName: string;
  email: string;
  source: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [rolesT, setRolesT] = useState<TrackerRole[]>([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewUsers, setPreviewUsers] = useState<ImportedUserDto[]>([]);
  const [selectedSource, setSelectedSource] = useState<'bitrix24' | 'trackstudio' | 'jira'>('bitrix24');
  const [importFile, setImportFile] = useState<File | null>(null);

  const [newUser, setNewUser] = useState<User & { password: string }>({
    id: 0,
    login: '',
    email: '',
    role: 'user',
    password: '',
    // новые поля
    userType: 'employee',
    trackerRoleId: 0,      // 0 = «нет роли»
    department: '',
  });

  const withAuth = async () => {
    const token = localStorage.getItem('token');
    const baseUrl = await getApiBase();
    return { baseUrl, headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUsers = async () => {
    try {
      const { baseUrl, headers } = await withAuth();
      const res = await axios.get(`${baseUrl}/users`, { headers });
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
    }
  };

  const fetchTrackerRoles = async () => {
    try {
      const { baseUrl, headers } = await withAuth();
      const res = await axios.get(`${baseUrl}/tracker/roles`, { headers });
      setRolesT([{ id: 0, title: '— нет роли —' }, ...res.data]);
    } catch {
      setRolesT([{ id: 0, title: '— нет роли —' }]);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser({
      ...user,
      trackerRoleId: user.trackerRoleId ?? 0,
      department: user.department ?? '',
      userType: user.userType ?? 'employee',
    });
    setShowEditModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCreateUser = async () => {
    try {
      const { baseUrl, headers } = await withAuth();
      await axios.post(`${baseUrl}/users`, {
        login: newUser.login,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        // новые поля
        userType: newUser.userType ?? 'employee',
        trackerRoleId: newUser.trackerRoleId ? Number(newUser.trackerRoleId) : null,
        department: newUser.department ? newUser.department.trim() : null,
      }, { headers });

      setShowCreateModal(false);
      setNewUser({
        id: 0, login: '', email: '', role: 'user', password: '',
        userType: 'employee', trackerRoleId: 0, department: ''
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании');
    }
  };

  const saveChanges = async () => {
    if (!selectedUser) return;
    try {
      const { baseUrl, headers } = await withAuth();
      await axios.patch(
        `${baseUrl}/users/${selectedUser.id}`,
        {
          login: selectedUser.login,
          email: selectedUser.email,
          role: selectedUser.role,
          // новые поля
          userType: selectedUser.userType ?? 'employee',
          trackerRoleId: selectedUser.trackerRoleId ? Number(selectedUser.trackerRoleId) : null,
          department: selectedUser.department ? selectedUser.department.trim() : null,
        },
        { headers },
      );
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось сохранить изменения');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const { baseUrl, headers } = await withAuth();
      await axios.delete(`${baseUrl}/users/${selectedUser.id}`, { headers });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const { baseUrl, headers } = await withAuth();
      const res = await axios.post(`${baseUrl}/import/bitrix`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setPreviewUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке файла');
    }
  };

  const handleConfirmImport = async () => {
    try {
      const { baseUrl, headers } = await withAuth();
      await axios.post(`${baseUrl}/import/bitrix/confirm`, previewUsers, { headers });
      fetchUsers();
      setShowImportModal(false);
      setPreviewUsers([]);
      setImportFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при подтверждении импорта');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTrackerRoles();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUserEdit /> Управление пользователями
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FaPlus /> Добавить
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaPlus /> Импортировать
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Логин</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Роль</th>
              <th className="p-2 border">РольТ</th>
              <th className="p-2 border">Отдел</th>
              <th className="p-2 border">Тип</th>
              <th className="p-2 border">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2 border">{user.id}</td>
                <td className="p-2 border">{user.login}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.role}</td>

                {/* РольТ */}
                <td className="p-2 border">
                  <select
                    className="border rounded px-2 py-1"
                    value={user.trackerRoleId ?? 0}
                    onChange={async (e) => {
                      const trackerRoleId = Number(e.target.value) || null;
                      try {
                        const { baseUrl, headers } = await withAuth();
                        await axios.patch(`${baseUrl}/users/${user.id}`, { trackerRoleId }, { headers });
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, trackerRoleId } : u));
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Не удалось обновить роль трекера');
                      }
                    }}
                  >
                    {rolesT.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </td>

                {/* Отдел */}
                <td className="p-2 border">
                  <input
                    className="border rounded px-2 py-1 w-48"
                    defaultValue={user.department ?? ''}
                    placeholder="Напр.: Продажи"
                    onBlur={async (e) => {
                      const department = e.target.value ? e.target.value.trim() : null;
                      try {
                        const { baseUrl, headers } = await withAuth();
                        await axios.patch(`${baseUrl}/users/${user.id}`, { department }, { headers });
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, department } : u));
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Не удалось обновить отдел');
                      }
                    }}
                  />
                </td>

                {/* Тип (userType) */}
                <td className="p-2 border">
                  <select
                    className="border rounded px-2 py-1"
                    value={user.userType ?? 'employee'}
                    onChange={async (e) => {
                      const userType = e.target.value as UserType;
                      try {
                        const { baseUrl, headers } = await withAuth();
                        await axios.patch(`${baseUrl}/users/${user.id}`, { userType }, { headers });
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, userType } : u));
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Не удалось обновить тип');
                      }
                    }}
                  >
                    <option value="employee">Сотрудник</option>
                    <option value="client">Клиент</option>
                  </select>
                </td>

                <td className="p-2 border">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <MdEdit /> Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:underline flex items-center gap-2"
                    >
                      <FaTrash /> Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== МОДАЛКИ ====== */}

      {/* Редактирование */}
      <ReactModal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Редактировать пользователя</h2>
        <input
          type="text"
          placeholder="Логин"
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.login || ''}
          onChange={(e) => setSelectedUser({ ...selectedUser!, login: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.email || ''}
          onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
        />
        <select
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.role}
          onChange={(e) => setSelectedUser({ ...selectedUser!, role: e.target.value as BaseRole })}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {/* РольТ и Отдел + Тип */}
        <select
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.trackerRoleId ?? 0}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser!, trackerRoleId: Number(e.target.value) || 0 })
          }
        >
          {rolesT.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Отдел (например: Продажи)"
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.department ?? ''}
          onChange={(e) => setSelectedUser({ ...selectedUser!, department: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded mb-4"
          value={selectedUser?.userType ?? 'employee'}
          onChange={(e) => setSelectedUser({ ...selectedUser!, userType: e.target.value as UserType })}
        >
          <option value="employee">Сотрудник</option>
          <option value="client">Клиент</option>
        </select>

        <div className="flex justify-center">
          <button
            onClick={saveChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2 flex items-center gap-2"
          >
            <FaSave /> Сохранить
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
          >
            <MdCancel /> Отмена
          </button>
        </div>
      </ReactModal>

      {/* Удаление */}
      <ReactModal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Удалить пользователя?</h2>
        <p className="mb-4">
          Вы уверены, что хотите удалить <strong>{selectedUser?.login}</strong>?
        </p>
        <div className="flex justify-center">
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 mr-2"
          >
            <FaTrash /> Удалить
          </button>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
          >
            <MdCancel /> Отмена
          </button>
        </div>
      </ReactModal>

      {/* Создание */}
      <ReactModal
        isOpen={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Добавить пользователя</h2>
        <input
          type="text"
          placeholder="Логин"
          className="w-full border p-2 rounded mb-3"
          value={newUser.login}
          onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full border p-2 rounded mb-3"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          className="w-full border p-2 rounded mb-3"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as BaseRole })}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {/* РольТ, Отдел, Тип */}
        <select
          className="w-full border p-2 rounded mb-3"
          value={newUser.trackerRoleId ?? 0}
          onChange={(e) => setNewUser({ ...newUser, trackerRoleId: Number(e.target.value) || 0 })}
        >
          {rolesT.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Отдел (например: Продажи)"
          className="w-full border p-2 rounded mb-3"
          value={newUser.department ?? ''}
          onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded mb-4"
          value={newUser.userType}
          onChange={(e) => setNewUser({ ...newUser, userType: e.target.value as UserType })}
        >
          <option value="employee">Сотрудник</option>
          <option value="client">Клиент</option>
        </select>

        <div className="flex justify-center">
          <button
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 mr-2"
          >
            <FaSave /> Создать
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
          >
            <MdCancel /> Отмена
          </button>
        </div>
      </ReactModal>

      {/* Импорт */}
      <ReactModal
        isOpen={showImportModal}
        onRequestClose={() => {
          setShowImportModal(false);
          setPreviewUsers([]);
          setImportFile(null);
        }}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Импорт пользователей</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Источник данных</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as any)}
          >
            <option value="bitrix24"> Bitrix24</option>
            <option value="trackstudio">TrackStudio</option>
            <option value="jira">Jira</option>
          </select>
        </div>

        {selectedSource === 'bitrix24' && (
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <SiBraintree size={20} /> <span>Импорт из Bitrix24 (CSV/XLS)</span>
          </div>
        )}
        {selectedSource === 'trackstudio' && (
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <SiApache size={20} /> <span>Импорт из TrackStudio пока не реализован</span>
          </div>
        )}
        {selectedSource === 'jira' && (
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <SiJira size={20} /> <span>Импорт из Jira пока не реализован</span>
          </div>
        )}

        {selectedSource === 'bitrix24' && (
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded mb-4"
          />
        )}

        {previewUsers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Предпросмотр пользователей:</h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1">ФИО</th>
                  <th className="border p-1">Email</th>
                  <th className="border p-1">Источник</th>
                </tr>
              </thead>
              <tbody>
                {previewUsers.map((u, idx) => (
                  <tr key={idx}>
                    <td className="border p-1">{u.fullName}</td>
                    <td className="border p-1">{u.email}</td>
                    <td className="border p-1">{u.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={previewUsers.length > 0 ? handleConfirmImport : handleImport}
          disabled={selectedSource !== 'bitrix24' || (!importFile && previewUsers.length === 0)}
          className={`mt-4 w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
            selectedSource !== 'bitrix24'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <FaSave />
          {previewUsers.length > 0 ? 'Импортировать в систему' : 'Импортировать'}
        </button>
      </ReactModal>
    </div>
  );
}
