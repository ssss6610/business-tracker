import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Setup from './pages/Setup';
import AdminPanel from './pages/AdminPanel';
import Monitoring from './pages/Monitoring';
import Roles from './pages/Roles';
import Thresholds from './pages/Thresholds'
import AdminLayout from './layouts/AdminLayout';
import TrackerSettings from'./pages/TrackerSettings' ;
import ChangePassword from './pages/ChangePassword';
import Workspace from'./pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/workspace" element={<Workspace />} />

        {/* Все защищённые маршруты внутри AdminLayout */}
        <Route path="/" element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/thresholds" element={<Thresholds />} />
          <Route path="/tracker" element={<TrackerSettings />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
