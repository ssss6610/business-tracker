import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Setup from './pages/Setup';
import ChangePassword from './pages/ChangePassword';

import AdminPanel from './pages/AdminPanel';
import Monitoring from './pages/Monitoring';
import Roles from './pages/Roles';
import Thresholds from './pages/Thresholds';
import TrackerSettings from './pages/TrackerSettings';

import WorkspaceHome from './pages/workspace/WorkspaceHome';
import ChatPage from './pages/workspace/ChatPage';
import CalendarPage from './pages/workspace/CalendarPage';
import TrackerPage from './pages/workspace/TrackerPage';
import EmployeesPage from './pages/workspace/EmployeesPage';
import MailPage from './pages/workspace/MailPage';
import AnalyticsPage from './pages/workspace/AnalyticsPage';

import PrivateRoute from './components/PrivateRoute';
import AppLayout from './layouts/AppLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Публичные маршруты */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* 🔐 Приватные маршруты с AppLayout (логотип + аватар) */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

          {/* Workspace (с сайдбаром слева) */}
          <Route path="workspace" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceHome />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="mail" element={<MailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Admin (другая боковая панель) */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="roles" element={<Roles />} />
            <Route path="thresholds" element={<Thresholds />} />
            <Route path="tracker" element={<TrackerSettings />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
