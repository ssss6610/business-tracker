// src/pages/TrackerSettings.tsx
import { useState } from 'react';
import ReactModal from 'react-modal';
import { FaFileImport} from 'react-icons/fa';

ReactModal.setAppElement('#root');

export default function TrackerSettings() {
  const [showClientImport, setShowClientImport] = useState(false);
  const [showCompanyImport, setShowCompanyImport] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки трекера</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowClientImport(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaFileImport /> Импорт клиентов
        </button>
        <button
          onClick={() => setShowCompanyImport(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <FaFileImport /> Импорт компаний
        </button>
      </div>

      {/* Модалка импорта клиентов */}
      <ReactModal
        isOpen={showClientImport}
        onRequestClose={() => setShowClientImport(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Импорт клиентов</h2>
        {/* 👇 Загрузку CSV и предпросмотр добавим позже */}
        <button
          onClick={() => setShowClientImport(false)}
          className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Закрыть
        </button>
      </ReactModal>

      {/* Модалка импорта компаний */}
      <ReactModal
        isOpen={showCompanyImport}
        onRequestClose={() => setShowCompanyImport(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Импорт компаний</h2>
        {/* 👇 Загрузку CSV и предпросмотр добавим позже */}
        <button
          onClick={() => setShowCompanyImport(false)}
          className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Закрыть
        </button>
      </ReactModal>
    </div>
  );
}
