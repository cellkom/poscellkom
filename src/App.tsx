import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MemberRoute from './components/MemberRoute';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';

import LoginPage from './pages/Auth/LoginPage';
import MemberLoginPage from './pages/Auth/MemberLoginPage';
import PublicPage from './pages/PublicPage';
import ProductsPage from './pages/ProductsPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import MemberProfilePage from './pages/MemberProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Dashboard/StockPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import InstallmentPage from './pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from './pages/Dashboard/Transaction/AddInstallmentPage';
import CustomerPage from './pages/Dashboard/Data/CustomerPage';
import SupplierPage from './pages/Dashboard/Data/SupplierPage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import TodayReportPage from './pages/Dashboard/Reports/TodayReportPage';
import UsersPage from './pages/Dashboard/UsersPage';
import NewsManagementPage from './pages/Dashboard/NewsManagementPage';
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster richColors position="top-center" />
            <Routes>
              <Route path="/" element={<PublicPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/member-login" element={<MemberLoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              
              <Route element={<MemberRoute />}>
                <Route path="/member-profile" element={<MemberProfilePage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/stock" element={<StockPage />} />
                <Route path="/dashboard/service-masuk" element={<ServiceMasukPage />} />
                <Route path="/dashboard/transaction/sales" element={<SalesPage />} />
                <Route path="/dashboard/transaction/service" element={<ServicePage />} />
                <Route path="/dashboard/transaction/installments" element={<InstallmentPage />} />
                <Route path="/dashboard/transaction/add-installment" element={<AddInstallmentPage />} />
                <Route path="/dashboard/data/customers" element={<CustomerPage />} />
                <Route path="/dashboard/data/suppliers" element={<SupplierPage />} />
                <Route path="/dashboard/reports" element={<ReportsPage />} />
                <Route path="/dashboard/reports/sales" element={<SalesReportPage />} />
                <Route path="/dashboard/reports/service" element={<ServiceReportPage />} />
                <Route path="/dashboard/reports/today" element={<TodayReportPage />} />
                <Route path="/dashboard/services-in-progress" element={<ServicesInProgressPage />} />
                
                <Route element={<AdminRoute />}>
                  <Route path="/dashboard/data/users" element={<UsersPage />} />
                  <Route path="/dashboard/news" element={<NewsManagementPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;