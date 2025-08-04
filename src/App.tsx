import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import HeadManager from './components/HeadManager'; // Import HeadManager
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading indicator

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
import MemberOrdersPage from './pages/MemberOrdersPage';

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
import OrderManagementPage from './pages/Dashboard/OrderManagementPage';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, loading, user } = useAuth();

  // Log states for debugging
  console.log('ProtectedRoute render:', { loading, user, profile, allowedRoles, currentPath: window.location.pathname });

  if (loading) {
    // Show a loading indicator while authentication state is being determined
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Memuat sesi...</h1>
          <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // After loading, if there's no authenticated user
  if (!user) {
    console.log('No authenticated user found. Redirecting.');
    // Redirect based on expected roles for this route
    if (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir')) {
      return <Navigate to="/login" replace />;
    }
    // Assuming other protected routes are for members
    return <Navigate to="/member-login" replace />;
  }

  // If user is authenticated, but profile is missing or role doesn't match
  // The `profile` might be null if `fetchProfile` failed or returned null.
  // `profile.role || ''` handles cases where role is undefined/null.
  if (!profile || !allowedRoles.includes(profile.role || '')) {
    console.log('User authenticated, but profile missing or role mismatch. Redirecting.', { profile, allowedRoles });
    // Determine the correct login page based on the user's actual role (if profile exists)
    // or the expected roles for the route.
    if (profile?.role === 'Member' && (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir'))) {
        // Member trying to access a staff route
        return <Navigate to="/member-login" replace />;
    }
    if ((profile?.role === 'Admin' || profile?.role === 'Kasir') && allowedRoles.includes('Member')) {
        // Staff trying to access a member route
        return <Navigate to="/login" replace />;
    }
    // If profile is null, or role doesn't match and no specific cross-role redirect,
    // default to the login page that matches the route's allowed roles.
    if (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir')) {
        return <Navigate to="/login" replace />;
    }
    // Default for member routes if profile is null or role is not 'Member'
    return <Navigate to="/member-login" replace />;
  }

  // If all checks pass (not loading, user exists, profile exists and role matches)
  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <SettingsProvider>
          <HeadManager /> {/* Add HeadManager here */}
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
                  path="/my-orders" 
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <MemberOrdersPage />
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
                <Route path="/dashboard/orders" element={<ProtectedRoute allowedRoles={['Admin', 'Kasir']}><DashboardLayout><OrderManagementPage /></DashboardLayout></ProtectedRoute>} />
                
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