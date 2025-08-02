import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import PublicPage from './pages/PublicPage';
import ProductsPage from './pages/ProductsPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import MemberLoginPage from './pages/MemberLoginPage';
import MemberRegisterPage from './pages/MemberRegisterPage';
import MemberProfilePage from './pages/MemberProfilePage';
import ServiceTrackingPage from './pages/ServiceTrackingPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import StaffPage from './pages/Dashboard/StaffPage';
import CustomersPage from './pages/Dashboard/CustomersPage';
import SuppliersPage from './pages/Dashboard/SuppliersPage';
import ProductsManagementPage from './pages/Dashboard/ProductsManagementPage';
import SalesTransactionPage from './pages/Dashboard/SalesTransactionPage';
import SalesReportPage from './pages/Dashboard/SalesReportPage';
import ServiceManagementPage from './pages/Dashboard/ServiceManagementPage';
import ServiceTransactionPage from './pages/Dashboard/ServiceTransactionPage';
import ServiceReportPage from './pages/Dashboard/ServiceReportPage';
import NewsManagementPage from './pages/Dashboard/NewsManagementPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import InstallmentPage from './pages/Dashboard/InstallmentPage';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/member-login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/member-login" element={<MemberLoginPage />} />
              <Route path="/member-register" element={<MemberRegisterPage />} />
              <Route path="/member-profile" element={<MemberProfilePage />} />
              <Route path="/tracking" element={<ServiceTrackingPage />} />

              {/* Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><DashboardPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/staff" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout><StaffPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/customers" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><CustomersPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/dashboard/suppliers" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><SuppliersPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/products" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><ProductsManagementPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/sales" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><SalesTransactionPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/sales-report" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout><SalesReportPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/services" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><ServiceManagementPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/service-transactions" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><ServiceTransactionPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/service-report" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout><ServiceReportPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/dashboard/installments" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><InstallmentPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/news" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout><NewsManagementPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/settings" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout><SettingsPage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                    <DashboardLayout><ProfilePage /></DashboardLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;