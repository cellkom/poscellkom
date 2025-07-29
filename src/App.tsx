import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Dashboard/Stock/StockPage';
import AddProductPage from './pages/Dashboard/Stock/AddProductPage';
import EditProductPage from './pages/Dashboard/Stock/EditProductPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import CustomerPage from './pages/Dashboard/MasterData/CustomerPage';
import ReportsPage from './pages/Dashboard/Reports/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import ProfitReportPage from './pages/Dashboard/Reports/ProfitReportPage';
import InstallmentPage from './pages/Dashboard/InstallmentPage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper splash screen
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<DashboardPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="stock/add" element={<AddProductPage />} />
        <Route path="stock/edit/:id" element={<EditProductPage />} />
        <Route path="transactions/sales" element={<SalesPage />} />
        <Route path="transactions/service" element={<ServicePage />} />
        <Route path="master-data/customers" element={<CustomerPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/sales" element={<SalesReportPage />} />
        <Route path="reports/service" element={<ServiceReportPage />} />
        <Route path="reports/profit" element={<ProfitReportPage />} />
        <Route path="installments" element={<InstallmentPage />} />
        <Route path="service-masuk" element={<ServiceMasukPage />} />
        <Route path="services-in-progress" element={<ServicesInProgressPage />} />
      </Route>
    </Routes>
  );
}

export default App;