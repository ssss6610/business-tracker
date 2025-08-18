// src/App.tsx
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
import WorkspaceLayout from "./layouts/WorkspaceLayout"; // 👈 добавили

import { getApiBase } from "./utils/getApiBase";
import { DEFAULT_BRAND } from "./utils/defaultBranding"; // 👈 путь на config

type Branding = { name: string; logoUrl: string | null };

// убрать все имеющиеся иконки и поставить наши (с cache-buster)
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

  // PNG — самый совместимый вариант
  add("icon", "image/png", "32x32");
  add("shortcut icon", "image/png", "32x32");
  add("apple-touch-icon", undefined, "180x180");
}

// делаем абсолютный URL для логотипа/фавикона
function toAbsolute(url: string | null, apiBase: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // картинки из бэка
  if (url.startsWith("/uploads")) return `${apiBase}${url}`;
  // public-ресурсы фронта (/logo.png, /favicon.png) — оставляем как есть
  return url;
}

export default function App() {
  const [brand, setBrand] = useState<Branding>({
    name: DEFAULT_BRAND.name,
    logoUrl: DEFAULT_BRAND.logoUrl,
  });
  const [apiBase, setApiBase] = useState<string>(window.location.origin);

  // первичная загрузка брендинга
  useEffect(() => {
    (async () => {
      const base = await getApiBase();
      setApiBase(base);
      try {
        const res = await fetch(`${base}/public/company`);
        if (res.ok) {
          const data = await res.json();
          setBrand({
            name: data?.name || DEFAULT_BRAND.name,
            logoUrl: data?.logoUrl ?? DEFAULT_BRAND.logoUrl,
          });
        }
      } catch {
        // оставим дефолт
      }
    })();
  }, []);

  // обновление из персонализации (CompanySettings)
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; logoUrl?: string | null }>;
      setBrand((prev) => ({
        name: ce.detail?.name || prev.name,
        logoUrl: ce.detail?.logoUrl ?? prev.logoUrl ?? DEFAULT_BRAND.logoUrl,
      }));
    };
    window.addEventListener("company:updated", onUpdated as any);
    return () => window.removeEventListener("company:updated", onUpdated as any);
  }, []);

  // глобально title + favicon (берём logoUrl как favicon, если отдельной нет)
  useEffect(() => {
    document.title = brand.name || DEFAULT_BRAND.name;

    // если в DEFAULT_BRAND нет faviconUrl, просто положи /favicon.png в public
    const defaultFav = (DEFAULT_BRAND as any).faviconUrl || "/favicon.png";
    const faviconCandidate = brand.logoUrl || defaultFav;
    const abs = toAbsolute(faviconCandidate, apiBase) || defaultFav;
    setFavicons(abs);
  }, [brand.name, brand.logoUrl, apiBase]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* WORKSPACE: AppLayout (топ-хедер) -> WorkspaceLayout (левый сайдбар) */}
        <Route
          path="/workspace"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceHome />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="mail" element={<MailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* ADMIN: у тебя уже всё ок */}
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
