import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import { FaUserEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import { MdEdit, MdCancel } from "react-icons/md";
import { SiBraintree, SiJira, SiApache } from "react-icons/si"; // Bitrix, Jira, TrackStudio (Apache icon как заглушка)
import { getApiBase } from '../../utils/getApiBase';

ReactModal.setAppElement('#root');

interface User {
  id: number;
  login: string;
  email: string;
  role: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
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
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = await getApiBase();
      const res= await axios.get(`${baseUrl}/users`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = await getApiBase();
      await axios.post(`${baseUrl}/users`, {
        login: newUser.login,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateModal(false);
      setNewUser({ id: 0, login: '', email: '', role: 'user', password: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании');
    }
  };

  const saveChanges = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');
    const baseUrl = await getApiBase();
    await axios.patch(
      `${baseUrl}/users/${selectedUser.id}`,
      {
        login: selectedUser.login,
        email: selectedUser.email,
        role: selectedUser.role,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setShowEditModal(false);
    fetchUsers();
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');
    const baseUrl = await getApiBase();
    await axios.delete(`${baseUrl}/users/${selectedUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowDeleteModal(false);
    fetchUsers();
  };

const handleImport = async () => {
  if (!importFile) return;

  const formData = new FormData();
  formData.append('file', importFile);

  const token = localStorage.getItem('token');

  try {
    const baseUrl = await getApiBase();
    const res = await axios.post(`${baseUrl}/import/bitrix`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    setPreviewUsers(res.data); // 👈 сохраняем результат
  } catch (err: any) {
    setError(err.response?.data?.message || 'Ошибка при загрузке CSV');
  }
};
const handleConfirmImport = async () => {
  const token = localStorage.getItem('token');

  try {
    const baseUrl = await getApiBase();
    await axios.post(`${baseUrl}/import/bitrix/confirm`, previewUsers, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers(); // обновить таблицу
    setShowImportModal(false);
    setPreviewUsers([]);
    setImportFile(null);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Ошибка при подтверждении импорта');
  }
};

  useEffect(() => {
    fetchUsers();
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

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Логин</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Роль</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2 border text-center">{user.id}</td>
              <td className="p-2 border text-center">{user.login}</td>
              <td className="p-2 border text-center">{user.email}</td>
              <td className="p-2 border text-center">{user.role}</td>
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

      {/* Модальные окна ниже: */}
      {/* Редактирование */}
      <ReactModal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Редактировать пользователя</h2>
        <input
          type="text"
          placeholder="Логин"
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.login || ''}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser!, login: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={selectedUser?.email || ''}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser!, email: e.target.value })
          }
        />
        <select
          className="w-full border p-2 rounded mb-4"
          value={selectedUser?.role}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser!, role: e.target.value })
          }
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <div className="flex justify-center">
          <button
            onClick={saveChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            <FaSave /> Сохранить
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
        overlayClassName="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
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
        overlayClassName="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
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
          className="w-full border p-2 rounded mb-4"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
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
  onRequestClose={() => {setShowImportModal(false); 
  setPreviewUsers([]);
  setImportFile(null);

}}
  className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
  overlayClassName="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
  <h2 className="text-xl font-bold mb-4">Импорт пользователей</h2>

  {/* Выбор источника */}
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

  {/* Описание источника и иконка */}
  {selectedSource === 'bitrix24' && (
    <div className="flex items-center gap-2 text-blue-600 mb-2">
      <SiBraintree size={20} /> <span>Импорт из Bitrix24 (CSV)</span>
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

  {/* Форма загрузки файла только для Bitrix24 */}
  {selectedSource === 'bitrix24' && (
    <input
      type="file"
      accept=".xls"
      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
      className="w-full border p-2 rounded mb-4"
    />
  )}
 {/* Предпросмотр (если есть) */}
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

{/* ✅ Кнопка — всегда внизу модалки */}
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
