import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Setup from './pages/Setup';
import ChangePassword from './pages/ChangePassword';

import AdminPanel from './pages/admin-panel/AdminPanel';
import Monitoring from './pages/admin-panel/Monitoring';
import Thresholds from './pages/admin-panel/Thresholds';
import TrackerSettings from './pages/admin-panel/TrackerSettings';
import CompanySettings from './pages/admin-panel/CompanySettings';

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
        {/* публичные */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* WORKSPACE ветка: своя обёртка */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="workspace" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceHome />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="mail" element={<MailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* ADMIN ветка: отдельная обёртка, чтобы не было двойной шапки */}
        <Route path="admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminPanel />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="thresholds" element={<Thresholds />} />
          <Route path="tracker" element={<TrackerSettings />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>

        {/* дефолт на админку (можешь сменить на workspace) */}
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
