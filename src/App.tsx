import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserProfile } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from 'sonner';

// Public Pages
import PublicPage from './pages/PublicPage';
import ProductsPage from './pages/ProductsPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import MemberProfilePage from './pages/MemberProfilePage';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import MemberLoginPage from './pages/Auth/MemberLoginPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Dashboard/UsersPage';
import StockPage from './pages/Dashboard/StockPage';
import SupplierPage from './pages/Dashboard/Data/SupplierPage';
import CustomerPage from './pages/Dashboard/Data/CustomerPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import InstallmentPage from './pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from './pages/Dashboard/Transaction/AddInstallmentPage';
import NewsManagementPage from './pages/Dashboard/NewsManagementPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import TodayReportPage from './pages/Dashboard/Reports/TodayReportPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import NotFound from './pages/NotFound';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: Array<UserProfile['role']>;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Memuat sesi...</div>;
  }

  if (!profile || !profile.role || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:slug" element={<NewsDetailPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/member-login" element={<MemberLoginPage />} />

      {/* Profile Routes */}
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><UserProfilePage /></ProtectedRoute>} />
      <Route path="/member-profile" element={<ProtectedRoute allowedRoles={['Member']}><MemberProfilePage /></ProtectedRoute>} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/stock" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><StockPage /></ProtectedRoute>} />
      <Route path="/dashboard/data/suppliers" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><SupplierPage /></ProtectedRoute>} />
      <Route path="/dashboard/data/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><CustomerPage /></ProtectedRoute>} />
      <Route path="/dashboard/transaction/sales" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><SalesPage /></ProtectedRoute>} />
      <Route path="/dashboard/transaction/services" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><ServicePage /></ProtectedRoute>} />
      <Route path="/dashboard/transaction/service-entry" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><ServiceMasukPage /></ProtectedRoute>} />
      <Route path="/dashboard/transaction/installments" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><InstallmentPage /></ProtectedRoute>} />
      <Route path="/dashboard/transaction/add-installment" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><AddInstallmentPage /></ProtectedRoute>} />
      <Route path="/dashboard/services-in-progress" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><ServicesInProgressPage /></ProtectedRoute>} />
      
      {/* Admin Only Routes */}
      <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={['Admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/dashboard/news-management" element={<ProtectedRoute allowedRoles={['Admin']}><NewsManagementPage /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['Admin']}><SettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={['Admin']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/dashboard/reports/sales" element={<ProtectedRoute allowedRoles={['Admin']}><SalesReportPage /></ProtectedRoute>} />
      <Route path="/dashboard/reports/service" element={<ProtectedRoute allowedRoles={['Admin']}><ServiceReportPage /></ProtectedRoute>} />
      <Route path="/dashboard/reports/today" element={<ProtectedRoute allowedRoles={['Admin']}><TodayReportPage /></ProtectedRoute>} />

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Toaster richColors position="top-center" />
            <AppRoutes />
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;