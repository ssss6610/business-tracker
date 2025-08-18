// src/components/LogoUploader.tsx
import { useEffect, useMemo, useState } from 'react';
import { makeAbsoluteUrl } from '../utils/assetUrl';

type LogoFile = { file: File | null; preview: string | null };

export default function LogoUploader({
  value,
  setValue,
  existingUrl,
  onRemoveExisting,
}: {
  value: LogoFile | null;
  setValue: (v: LogoFile | null) => void;
  existingUrl?: string;
  onRemoveExisting?: () => void;
}) {
  // абсолютный URL + cache-buster, чтобы сразу видеть новый файл
  const resolvedExisting = useMemo(() => {
    if (!existingUrl) return null;
    return makeAbsoluteUrl(existingUrl).then((u) =>
      u ? `${u}?v=${Date.now()}` : null
    );
  }, [existingUrl]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue({ file, preview: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
      {/* превью: новый файл приоритетнее */}
      {value?.preview ? (
        <img
          alt="Логотип"
          src={value.preview}
          className="mx-auto h-16 w-16 rounded object-contain"
        />
      ) : (
        <AwaitedImg promiseUrl={resolvedExisting} />
      )}

      <div className="mt-4 flex items-center justify-center gap-3">
        <label className="cursor-pointer rounded border px-3 py-2 text-sm hover:bg-gray-50">
          Выбрать файл
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={onPick}
          />
        </label>

        {existingUrl && onRemoveExisting && !value?.file && (
          <button
            type="button"
            onClick={onRemoveExisting}
            className="rounded bg-rose-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-200"
          >
            Удалить текущий логотип
          </button>
        )}
      </div>
    </div>
  );
}

/** Вспомогательный компонент, чтобы подождать makeAbsoluteUrl (он async) */
function AwaitedImg({ promiseUrl }: { promiseUrl: Promise<string | null> | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await promiseUrl;
      if (alive) setUrl(u);
    })();
    return () => {
      alive = false;
    };
  }, [promiseUrl]);

  if (!url) {
    return <div className="text-sm text-gray-500">Логотип</div>;
  }
  return (
    <img
      alt="Логотип"
      src={url}
      className="mx-auto h-16 w-16 rounded object-contain"
    />
  );
}
