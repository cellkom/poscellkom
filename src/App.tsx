import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import PublicPage from './pages/PublicPage';
import LoginPage from './pages/Auth/LoginPage';
import NotFound from './pages/NotFound';

// Dashboard pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import StockPage from './pages/Dashboard/StockPage';
import StorePage from './pages/Dashboard/StorePage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import CustomerPage from './pages/Dashboard/Data/CustomerPage';
import SupplierPage from './pages/Dashboard/Data/SupplierPage';
import UsersPage from './pages/Dashboard/UsersPage';
import ItPage from './pages/Dashboard/ItPage';
import InfoServicePage from './pages/Dashboard/InfoServicePage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import InstallmentPage from './pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from './pages/Dashboard/Transaction/AddInstallmentPage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import TodayReportPage from './pages/Dashboard/Reports/TodayReportPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Main Navigation Routes */}
            <Route path="/dashboard/cashier" element={<SalesPage />} />
            <Route path="/dashboard/stock" element={<StockPage />} />
            <Route path="/dashboard/store" element={<StorePage />} />
            <Route path="/dashboard/info-service" element={<InfoServicePage />} />
            <Route path="/dashboard/it" element={<ItPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/customers" element={<CustomerPage />} />
            <Route path="/dashboard/suppliers" element={<SupplierPage />} />
            
            {/* Additional Transaction & Service Routes */}
            <Route path="/dashboard/transaction/service" element={<ServicePage />} />
            <Route path="/dashboard/transaction/installments" element={<InstallmentPage />} />
            <Route path="/dashboard/transaction/add-installment" element={<AddInstallmentPage />} />
            <Route path="/dashboard/service-entry" element={<ServiceMasukPage />} />
            <Route path="/dashboard/services-in-progress" element={<ServicesInProgressPage />} />

            {/* Additional Reporting Routes */}
            <Route path="/dashboard/reports/sales" element={<SalesReportPage />} />
            <Route path="/dashboard/reports/service" element={<ServiceReportPage />} />
            <Route path="/dashboard/reports/today" element={<TodayReportPage />} />

            {/* Admin Only Route */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard/settings" element={<UsersPage />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;