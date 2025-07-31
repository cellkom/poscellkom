import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

// Layouts & Guards
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Pages
import LoginPage from '@/pages/Auth/LoginPage';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Dashboard Pages
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import TransactionPage from '@/pages/Dashboard/Transaction/Index';
import SalesPage from '@/pages/Dashboard/Transaction/SalesPage';
import ServiceTransactionPage from '@/pages/Dashboard/Transaction/ServicePage';
import StockPage from '@/pages/Dashboard/StockPage';
import CustomerPage from '@/pages/Dashboard/Data/CustomerPage';
import SupplierPage from '@/pages/Dashboard/Data/SupplierPage';
import ServiceLandingPage from '@/pages/Dashboard/Service/Index';
import ServiceMasukPage from '@/pages/Dashboard/ServiceMasukPage';
import InstallmentPage from '@/pages/Dashboard/Transaction/InstallmentPage';
import AddInstallmentPage from '@/pages/Dashboard/Transaction/AddInstallmentPage';
import ReportsPage from '@/pages/Dashboard/ReportsPage';
import TodayReportPage from '@/pages/Dashboard/Reports/TodayReportPage';
import SalesReportPage from '@/pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from '@/pages/Dashboard/Reports/ServiceReportPage';
import UsersPage from '@/pages/Dashboard/UsersPage';
import SettingsPage from '@/pages/Settings';
import ServicesInProgressPage from '@/pages/Dashboard/ServicesInProgressPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster richColors />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout><Outlet /></DashboardLayout>}>
                <Route index element={<DashboardPage />} />
                
                {/* Transaksi */}
                <Route path="transaction" element={<TransactionPage />} />
                <Route path="transaction/sales" element={<SalesPage />} />
                <Route path="transaction/service" element={<ServiceTransactionPage />} />
                <Route path="transaction/installments" element={<InstallmentPage />} />
                <Route path="transaction/add-installment" element={<AddInstallmentPage />} />

                {/* Data Master */}
                <Route path="stock" element={<StockPage />} />
                <Route path="customers" element={<CustomerPage />} />
                <Route path="suppliers" element={<SupplierPage />} />

                {/* Service */}
                <Route path="service" element={<ServiceLandingPage />} />
                <Route path="service/entry" element={<ServiceMasukPage />} />
                <Route path="services-in-progress" element={<ServicesInProgressPage />} />

                {/* Laporan */}
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/today" element={<TodayReportPage />} />
                <Route path="reports/sales" element={<SalesReportPage />} />
                <Route path="reports/service" element={<ServiceReportPage />} />

                {/* Admin */}
                <Route element={<AdminRoute />}>
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;