import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PublicLayout from "./components/Layout/PublicLayout";
import DashboardLayout from "./components/Layout/DashboardLayout";
import PublicPage from "./pages/PublicPage"; // Corrected import
import LoginPage from "./pages/Auth/LoginPage"; // Corrected import path
import MemberLoginPage from "./pages/Auth/MemberLoginPage"; // Added import for MemberLoginPage
import ServiceTrackingPage from "./pages/ServiceTrackingPage";
import ProductsPage from "./pages/ProductsPage"; // Public products page
import NewsPage from "./pages/NewsPage"; // Public news page
import NewsDetailPage from "./pages/NewsDetailPage"; // Public news detail page

// Dashboard Pages
import DashboardIndexPage from "./pages/Dashboard/DashboardPage"; // Renamed to avoid conflict with PublicPage
import StockPage from "./pages/Dashboard/StockPage"; // Renamed from ProductsPage to StockPage
import SalesPage from "./pages/Dashboard/Transaction/SalesPage";
import CustomerPage from "./pages/Dashboard/Data/CustomerPage"; // Renamed from CustomersPage
import SupplierPage from "./pages/Dashboard/Data/SupplierPage"; // Renamed from SuppliersPage
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import InstallmentPage from "./pages/Dashboard/Transaction/InstallmentPage"; // Renamed from InstallmentsPage
import AddInstallmentPage from "./pages/Dashboard/Transaction/AddInstallmentPage";
import ServicePage from "./pages/Dashboard/Transaction/ServicePage";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import SalesReportPage from "./pages/Dashboard/Reports/SalesReportPage";
import ServiceReportPage from "./pages/Dashboard/Reports/ServiceReportPage";
import TodayReportPage from "./pages/Dashboard/Reports/TodayReportPage";
import ServicesInProgressPage from "./pages/Dashboard/ServicesInProgressPage";
import UsersPage from "./pages/Dashboard/UsersPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import NewsManagementPage from "./pages/Dashboard/NewsManagementPage";
import UserProfilePage from "./pages/UserProfilePage";
import MemberProfilePage from "./pages/MemberProfilePage";
import NotFound from "./pages/NotFound";


import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster richColors />
    </Router>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Memuat autentikasi...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><PublicPage /></PublicLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/member-login" element={<MemberLoginPage />} />
      <Route path="/track-service" element={<PublicLayout><ServiceTrackingPage /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
      <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
      <Route path="/news/:slug" element={<PublicLayout><NewsDetailPage /></PublicLayout>} />
      <Route path="/profile" element={<PublicLayout><UserProfilePage /></PublicLayout>} />
      <Route path="/member-profile" element={<PublicLayout><MemberProfilePage /></PublicLayout>} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={user ? <DashboardLayout><DashboardRoutes /></DashboardLayout> : <Navigate to="/login" replace />}
      />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardIndexPage />} /> {/* Default dashboard page */}
      <Route path="stock" element={<StockPage />} />
      <Route path="sales" element={<SalesPage />} />
      <Route path="customers" element={<CustomerPage />} />
      <Route path="suppliers" element={<SupplierPage />} />
      <Route path="service-entries" element={<ServiceMasukPage />} />
      <Route path="installments" element={<InstallmentPage />} />
      <Route path="transaction/add-installment" element={<AddInstallmentPage />} />
      <Route path="transaction/service" element={<ServicePage />} />
      <Route path="transaction/sales" element={<SalesPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="reports/sales" element={<SalesReportPage />} />
      <Route path="reports/service" element={<ServiceReportPage />} />
      <Route path="reports/today" element={<TodayReportPage />} />
      <Route path="services-in-progress" element={<ServicesInProgressPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="news" element={<NewsManagementPage />} />
    </Routes>
  );
}

export default App;