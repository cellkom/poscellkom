import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PublicLayout from "./components/Layout/PublicLayout";
import DashboardLayout from "./components/Layout/DashboardLayout";
import IndexPage from "./pages/Index";
import LoginPage from "./pages/Login";
import ServiceTrackingPage from "./pages/ServiceTrackingPage";
import ProductsPage from "./pages/Dashboard/ProductsPage";
import SalesPage from "./pages/Dashboard/SalesPage";
import CustomersPage from "./pages/Dashboard/CustomersPage";
import SuppliersPage from "./pages/Dashboard/SuppliersPage";
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import InstallmentsPage from "./pages/Dashboard/InstallmentsPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import NewsManagementPage from "./pages/Dashboard/NewsManagementPage"; // Import the new page
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
    return <div>Loading authentication...</div>; // Or a spinner
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><IndexPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/track-service" element={<PublicLayout><ServiceTrackingPage /></PublicLayout>} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={user ? <DashboardLayout><DashboardRoutes /></DashboardLayout> : <Navigate to="/login" replace />}
      />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<ProductsPage />} /> {/* Default dashboard page */}
      <Route path="products" element={<ProductsPage />} />
      <Route path="sales" element={<SalesPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="suppliers" element={<SuppliersPage />} />
      <Route path="service-entries" element={<ServiceMasukPage />} />
      <Route path="installments" element={<InstallmentsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="news" element={<NewsManagementPage />} /> {/* New route for News Management */}
    </Routes>
  );
}

export default App;