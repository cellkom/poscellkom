import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MemberRoute from './components/MemberRoute';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';

import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Dashboard/StockPage';
import StorePage from './pages/Dashboard/StorePage';
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
import ServiceMasukPage from './pages/Dashboard/ServiceMasukPage';
import ServicesInProgressPage from './pages/Dashboard/ServicesInProgressPage';
import NotFound from './pages/NotFound';

// Member Pages
import MemberHomePage from './pages/Member/MemberHomePage';
import OrderPage from './pages/Member/OrderPage';
import ProductDetailPage from './pages/Member/ProductDetailPage';
import CartPage from './pages/Member/CartPage';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster richColors position="top-center" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rute Staf/Admin */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/store" element={<StorePage />} />
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
                  <Route path="/dashboard/users" element={<UsersPage />} />
                </Route>
              </Route>

              {/* Rute Member */}
              <Route element={<MemberRoute />}>
                  <Route path="/member/home" element={<MemberHomePage />} />
                  <Route path="/member/product/:productId" element={<ProductDetailPage />} />
                  <Route path="/member/cart" element={<CartPage />} />
                  <Route path="/member/order/:orderId" element={<OrderPage />} />
                  <Route path="/member/orders" element={<OrderPage />} /> 
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