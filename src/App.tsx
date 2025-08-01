import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SalesPage from './pages/Dashboard/SalesPage';
import StockPage from './pages/Dashboard/StockPage';
import ServicePage from './pages/Dashboard/ServicePage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import CustomersPage from './pages/Dashboard/CustomersPage';
import SuppliersPage from './pages/Dashboard/SuppliersPage';
import InstallmentsPage from './pages/Dashboard/InstallmentsPage';

const AppRoutes = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/sales" element={session ? <SalesPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/stock" element={session ? <StockPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/service" element={session ? <ServicePage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/reports" element={session ? <ReportsPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/settings" element={session ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/customers" element={session ? <CustomersPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/suppliers" element={session ? <SuppliersPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/installments" element={session ? <InstallmentsPage /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </Router>
  );
}

export default App;