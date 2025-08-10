import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Setup from './pages/Setup';
import AdminPanel from './pages/AdminPanel';
import Monitoring from './pages/Monitoring';
import Roles from './pages/Roles';
import Thresholds from './pages/Thresholds';
import AdminLayout from './layouts/AdminLayout';
import TrackerSettings from './pages/TrackerSettings';
import ChangePassword from './pages/ChangePassword';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import ChatPage from './pages/ChatPage';
import CalendarPage from './pages/CalendarPage';
import TrackerPage from './pages/TrackerPage';
import EmployeesPage from './pages/EmployeesPage';
import MailPage from './pages/MailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WorkspaceHome from './pages/WorkspaceHome';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Приватные маршруты: Workspace */}
        <Route path="/workspace" element={ <PrivateRoute> <WorkspaceLayout /> </PrivateRoute>}>
          <Route index element={<WorkspaceHome />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Приватные маршруты: Admin */}
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
          <Route path="roles" element={<Roles />} />
          <Route path="thresholds" element={<Thresholds />} />
          <Route path="tracker" element={<TrackerSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
