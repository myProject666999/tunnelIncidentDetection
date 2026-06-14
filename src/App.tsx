import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '@/components/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import IncidentList from '@/pages/IncidentList';
import IncidentDetail from '@/pages/IncidentDetail';
import PlanList from '@/pages/PlanList';
import ReportList from '@/pages/ReportList';
import ReportDetail from '@/pages/ReportDetail';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<IncidentList />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="plans" element={<PlanList />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="reports/:id" element={<ReportDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
