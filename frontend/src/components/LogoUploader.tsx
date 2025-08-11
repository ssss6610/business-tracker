import { useCallback, useMemo, useRef, useState } from 'react';

export type LogoFile = {
  file: File | null;     // null, если используем только existingUrl
  preview: string | null; // dataURL для превью локального файла
};

type Props = {
  value: LogoFile | null;
  setValue: (v: LogoFile | null) => void;
  existingUrl?: string;
  onRemoveExisting?: () => void;
  maxSizeMb?: number; // по умолчанию 2 МБ
};

export default function LogoUploader({
  value,
  setValue,
  existingUrl,
  onRemoveExisting,
  maxSizeMb = 2,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const effectivePreview = useMemo(() => value?.preview ?? existingUrl ?? null, [value, existingUrl]);

  const pick = useCallback(() => inputRef.current?.click(), []);

  const onFile = useCallback(
    (file: File) => {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowed.includes(file.type)) {
        alert('Поддерживаются PNG, JPG, SVG');
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        alert(`Файл больше ${maxSizeMb} МБ`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setValue({ file, preview: String(reader.result) });
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMb, setValue]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const clearLocal = () => setValue(null);
  const removeExisting = () => onRemoveExisting?.();

  return (
    <div className="mt-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition
          ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
        aria-label="Загрузить логотип"
      >
        {effectivePreview ? (
          <img
            src={effectivePreview}
            alt="Логотип"
            className="h-24 w-24 rounded-md object-contain"
            draggable={false}
          />
        ) : (
          <div className="text-sm text-gray-500">
            Перетащите файл сюда или <span className="text-indigo-600 underline">выберите</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={onInputChange}
          className="hidden"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={pick}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            Выбрать файл
          </button>

          {value?.file && (
            <button
              type="button"
              onClick={clearLocal}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            >
              Очистить выбор
            </button>
          )}

          {!value?.file && effectivePreview && onRemoveExisting && (
            <button
              type="button"
              onClick={removeExisting}
              className="rounded-md border border-rose-200 px-3 py-1 text-sm text-rose-600 hover:bg-rose-50"
            >
              Удалить текущий логотип
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
