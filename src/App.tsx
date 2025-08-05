import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NewsProvider } from './hooks/use-news';
import { StockProvider } from './hooks/use-stock'; // Import StockProvider
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider'; // Corrected import path
import HeadManager from './components/HeadManager';
import { Loader2 } from 'lucide-react';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage'; // Corrected import path
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
import RegisterPage from './pages/Auth/RegisterPage';

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
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Corrected import path

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SettingsProvider>
        <Router>
          <HeadManager />
          <AuthProvider>
            <CartProvider>
              <NewsProvider>
                <StockProvider> {/* Wrap with StockProvider */}
                  <Routes>
                    {/* Public & Auth Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:slug" element={<NewsDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/member-login" element={<MemberLoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
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
                </StockProvider>
              </NewsProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;