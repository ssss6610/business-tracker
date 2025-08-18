import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import ChangePassword from "./pages/ChangePassword";
import AdminPanel from "./pages/admin-panel/AdminPanel";
import Monitoring from "./pages/admin-panel/Monitoring";
import Thresholds from "./pages/admin-panel/Thresholds";
import TrackerSettings from "./pages/admin-panel/TrackerSettings";
import CompanySettings from "./pages/admin-panel/CompanySettings";
import WorkspaceHome from "./pages/workspace/WorkspaceHome";
import ChatPage from "./pages/workspace/ChatPage";
import CalendarPage from "./pages/workspace/CalendarPage";
import TrackerPage from "./pages/workspace/TrackerPage";
import EmployeesPage from "./pages/workspace/EmployeesPage";
import MailPage from "./pages/workspace/MailPage";
import AnalyticsPage from "./pages/workspace/AnalyticsPage";
import PrivateRoute from "./components/PrivateRoute";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import { getApiBase } from "./utils/getApiBase";

// Тип для бренда
type Branding = { name: string; logoUrl: string | null };

// ─────────────────────────────────────────────
// Утилита для абсолютного пути
function resolveAbsolute(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const rel = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${rel}`;
}

// Утилита для установки фавиконок
function setFavicons(absUrl: string | null) {
  // удалить все старые
  document
    .querySelectorAll("link[rel='icon'], link[rel='shortcut icon']")
    .forEach((el) => el.parentElement?.removeChild(el));

  if (!absUrl) return;

  const withBust = `${absUrl}?v=${Date.now()}`;
  const ext = withBust.split("?")[0].split(".").pop()?.toLowerCase();
  const type =
    ext === "svg"
      ? "image/svg+xml"
      : ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : undefined;

  const make = (rel: string) => {
    const link = document.createElement("link");
    link.rel = rel;
    if (type) link.type = type;
    link.href = withBust;
    document.head.appendChild(link);
  };

  make("icon");
  make("shortcut icon");
}
// ─────────────────────────────────────────────

export default function App() {
  const [brand, setBrand] = useState<Branding>({
    name: "OpenWorkspace",
    logoUrl: null,
  });
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);

  // Загружаем бренд при старте
  useEffect(() => {
    (async () => {
      const base = await getApiBase();
      setBaseUrl(base);
      try {
        const res = await fetch(`${base}/public/company`);
        if (res.ok) {
          const data = await res.json();
          setBrand({
            name: data?.name || "OpenWorkspace",
            logoUrl: data?.logoUrl ?? null,
          });
        }
      } catch {
        // если не получилось — оставляем дефолт
      }
    })();
  }, []);

  // Слушаем событие обновления персонализации
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; logoUrl?: string | null }>;
      setBrand((prev) => ({
        ...prev,
        name: ce.detail?.name || prev.name,
        logoUrl: ce.detail?.logoUrl ?? prev.logoUrl,
      }));
    };
    window.addEventListener("company:updated", onUpdated as any);
    return () => window.removeEventListener("company:updated", onUpdated as any);
  }, []);

  // 🔹 Меняем title и favicon глобально
  useEffect(() => {
    if (brand.name) {
      document.title = brand.name;
    }
    const abs = resolveAbsolute(brand.logoUrl, baseUrl || window.location.origin);
    setFavicons(abs);
  }, [brand.name, brand.logoUrl, baseUrl]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/workspace"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<WorkspaceHome />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="thresholds" element={<Thresholds />} />
          <Route path="tracker" element={<TrackerSettings />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
