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
import { DEFAULT_BRAND } from "./utils/defaultBranding";

type Branding = { name: string; logoUrl: string | null; faviconUrl: string | null };

// удалить все иконки и поставить наши (с cache-buster)
function setFavicons(absUrl: string | null) {
  const selectors =
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"]';
  document.querySelectorAll(selectors).forEach((el) => el.parentElement?.removeChild(el));

  if (!absUrl) return;

  const withBust = `${absUrl}${absUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

  const add = (rel: string, type?: string, sizes?: string) => {
    const link = document.createElement("link");
    link.rel = rel;
    if (type) link.type = type;
    if (sizes) link.sizes = sizes;
    link.href = withBust;
    document.head.appendChild(link);
  };

  // PNG — совместимый вариант
  add("icon", "image/png", "32x32");
  add("shortcut icon", "image/png", "32x32");
  add("apple-touch-icon", undefined, "180x180");
}

export default function App() {
  const [brand, setBrand] = useState<Branding>({
    name: DEFAULT_BRAND.name,
    logoUrl: DEFAULT_BRAND.logoUrl,
    faviconUrl: DEFAULT_BRAND.faviconUrl,
  });

  // первичная загрузка брендинга
  useEffect(() => {
    (async () => {
      const base = await getApiBase();
      try {
        const res = await fetch(`${base}/public/company`);
        if (res.ok) {
          const data = await res.json();
          setBrand({
            name: data?.name || DEFAULT_BRAND.name,
            logoUrl: data?.logoUrl ?? DEFAULT_BRAND.logoUrl,
            faviconUrl: data?.faviconUrl ?? DEFAULT_BRAND.faviconUrl, // может отсутствовать на бэке
          });
        }
      } catch {
        // остаёмся на дефолтах
      }
    })();
  }, []);

  // обновление из персонализации (CompanySettings)
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; logoUrl?: string | null; faviconUrl?: string | null }>;
      setBrand((prev) => ({
        name: ce.detail?.name || prev.name,
        logoUrl: ce.detail?.logoUrl ?? prev.logoUrl ?? DEFAULT_BRAND.logoUrl,
        faviconUrl: ce.detail?.faviconUrl ?? prev.faviconUrl ?? DEFAULT_BRAND.faviconUrl,
      }));
    };
    window.addEventListener("company:updated", onUpdated as any);
    return () => window.removeEventListener("company:updated", onUpdated as any);
  }, []);

  // глобально title + favicon
  useEffect(() => {
    document.title = brand.name || DEFAULT_BRAND.name;
    // faviconUrl хранится как public-путь: /favicon.png или полный URL
    const abs = brand.faviconUrl?.startsWith("http")
      ? brand.faviconUrl
      : brand.faviconUrl || DEFAULT_BRAND.faviconUrl; // /favicon.png
    setFavicons(abs);
  }, [brand.name, brand.faviconUrl]);

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
