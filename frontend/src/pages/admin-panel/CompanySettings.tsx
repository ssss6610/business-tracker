import { useEffect, useState } from 'react';

export default function CompanySettings() {
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('companyName') || 'Business Tracker';
    const savedLogo = localStorage.getItem('companyLogo');
    setName(savedName);
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('companyName', name);
    if (logoPreview) localStorage.setItem('companyLogo', logoPreview);
    alert('Настройки сохранены!');
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-2xl font-semibold">Настройки компании</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Название компании:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Логотип:</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {logoPreview && (
          <div className="mt-3">
            <img
              src={logoPreview}
              alt="Превью логотипа"
              className="h-16 object-contain border rounded"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Сохранить
      </button>
    </div>
  );
}
