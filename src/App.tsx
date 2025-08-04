import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import PublicPage from './pages/PublicPage';
import ProductsPage from './pages/ProductsPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import MemberProfilePage from './pages/MemberProfilePage';
import ServiceTrackingPage from './pages/ServiceTrackingPage';
import CheckoutPage from './pages/CheckoutPage';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import MemberLoginPage from './pages/Auth/MemberLoginPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Dashboard/UsersPage';
import CustomerPage from './pages/Dashboard/Data/CustomerPage';
import SupplierPage from './pages/Dashboard/Data/SupplierPage';
import MembersPage from './pages/Dashboard/Data/MembersPage';
import StockPage from './pages/Dashboard/StockPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import InstallmentPage from './pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from './pages/Dashboard/Transaction/AddInstallmentPage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import TodayReportPage from './pages/Dashboard/Reports/TodayReportPage';
import UserProfilePage from './pages/UserProfilePage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import NewsManagementPage from './pages/Dashboard/NewsManagementPage';
import SettingsPage from './pages/Dashboard/SettingsPage';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Memuat...</div>;
  }

  if (!profile || !allowedRoles.includes(profile.role || '')) {
    if (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir')) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/member-login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Public & Auth Routes */}
                <Route path="/" element={<PublicPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/member-login" element={<MemberLoginPage />} />
                <Route path="/tracking" element={<ServiceTrackingPage />} />
                
                {/* Protected Member Route */}
                <Route 
                  path="/member-profile" 
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <MemberProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Staff/Admin Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                      <UserProfilePage />
                    </ProtectedRoute>
                  } 
                />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/stock" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><StockPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/service-masuk" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><ServiceMasukPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/services-in-progress" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><ServicesInProgressPage /></DashboardLayout></ProtectedRoute>} />
                
                {/* Transactions */}
                <Route path="/dashboard/transaction/sales" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><SalesPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/transaction/service" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><ServicePage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/transaction/installments" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><InstallmentPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/transaction/add-installment" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><AddInstallmentPage /></DashboardLayout></ProtectedRoute>} />

                {/* Data Management */}
                <Route path="/dashboard/data/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><CustomerPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/data/suppliers" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><SupplierPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/data/users" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><UsersPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/data/members" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><MembersPage /></DashboardLayout></ProtectedRoute>} />

                {/* Reports */}
                <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/reports/today" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><TodayReportPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/reports/sales" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><SalesReportPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/reports/service" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><ServiceReportPage /></DashboardLayout></ProtectedRoute>} />

                {/* Other Admin Routes */}
                <Route path="/dashboard/news" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><NewsManagementPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />

              </Routes>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;