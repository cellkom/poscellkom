import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Page
import PublicPage from './pages/PublicPage';

// Auth Page
import LoginPage from './pages/Auth/LoginPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import StockPage from './pages/Dashboard/StockPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import InstallmentsPage from './pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from './pages/Dashboard/Transaction/AddInstallmentPage';
import CustomersPage from './pages/Dashboard/Data/CustomerPage';
import SuppliersPage from './pages/Dashboard/Data/SupplierPage';
import UsersPage from './pages/Dashboard/UsersPage';

// Report Pages
import ReportsPage from './pages/Dashboard/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import TodayReportPage from './pages/Dashboard/Reports/TodayReportPage';

// Not Found Page
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public and Auth Routes */}
          <Route path="/" element={<PublicPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/transaction/sales" element={<SalesPage />} />
            <Route path="/dashboard/stock" element={<StockPage />} />
            <Route path="/dashboard/service-masuk" element={<ServiceMasukPage />} />
            <Route path="/dashboard/transaction/service" element={<ServicePage />} />
            <Route path="/dashboard/services-in-progress" element={<ServicesInProgressPage />} />
            <Route path="/dashboard/transaction/installments" element={<InstallmentsPage />} />
            <Route path="/dashboard/transaction/add-installment" element={<AddInstallmentPage />} />
            <Route path="/dashboard/data/customers" element={<CustomersPage />} />
            <Route path="/dashboard/data/suppliers" element={<SuppliersPage />} />
            
            {/* Reports */}
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/reports/sales" element={<SalesReportPage />} />
            <Route path="/dashboard/reports/service" element={<ServiceReportPage />} />
            <Route path="/dashboard/reports/today" element={<TodayReportPage />} />

            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard/users" element={<UsersPage />} />
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