import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'sonner';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';
import MainLayout from './components/Layout/MainLayout';

// Main Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ServicesPage from './pages/ServicesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import MemberLoginPage from './pages/Auth/MemberLoginPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Dashboard/UsersPage';
import DashboardProductsPage from './pages/Dashboard/ProductsPage';
import SuppliersPage from './pages/Dashboard/SuppliersPage';
import CustomersPage from './pages/Dashboard/CustomersPage';
import SalesTransactionsPage from './pages/Dashboard/SalesTransactionsPage';
import CreateSalePage from './pages/Dashboard/CreateSalePage';
import SaleDetailPage from './pages/Dashboard/SaleDetailPage';
import ServiceEntriesPage from './pages/Dashboard/ServiceEntriesPage';
import CreateServiceEntryPage from './pages/Dashboard/CreateServiceEntryPage';
import CreateServiceTransactionPage from './pages/Dashboard/CreateServiceTransactionPage';
import InstallmentsPage from './pages/Dashboard/InstallmentsPage';
import DashboardNewsPage from './pages/Dashboard/NewsPage';
import CreateNewsPage from './pages/Dashboard/CreateNewsPage';
import EditNewsPage from './pages/Dashboard/EditNewsPage';
import SettingsPage from './pages/Dashboard/SettingsPage';

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
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster richColors position="top-center" />
          <Routes>
            {/* Main Site Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:slug" element={<NewsDetailPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member-login" element={<MemberLoginPage />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><UsersPage /></ProtectedRoute>} />
              <Route path="products" element={<DashboardProductsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="sales" element={<SalesTransactionsPage />} />
              <Route path="sales/create" element={<CreateSalePage />} />
              <Route path="sales/:id" element={<SaleDetailPage />} />
              <Route path="services" element={<ServiceEntriesPage />} />
              <Route path="services/create" element={<CreateServiceEntryPage />} />
              <Route path="services/transaction/:id" element={<CreateServiceTransactionPage />} />
              <Route path="installments" element={<InstallmentsPage />} />
              <Route path="news" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardNewsPage /></ProtectedRoute>} />
              <Route path="news/create" element={<ProtectedRoute allowedRoles={['Admin']}><CreateNewsPage /></ProtectedRoute>} />
              <Route path="news/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><EditNewsPage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['Admin']}><SettingsPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;