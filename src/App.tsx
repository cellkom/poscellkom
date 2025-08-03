import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./pages/Index";
import AboutPage from "./pages/About";
import DashboardLayout from "./components/Layout/DashboardLayout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProductsPage from "./pages/Dashboard/ProductsPage";
import SuppliersPage from "./pages/Dashboard/SuppliersPage";
import CustomersPage from "./pages/Dashboard/CustomersPage";
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import ServiceTrackingPage from "./pages/ServiceTrackingPage";
import SalesPage from "./pages/Dashboard/SalesPage";
import ServicePage from "./pages/Dashboard/ServicePage";
import InstallmentPage from "./pages/Dashboard/InstallmentPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import UserManagementPage from "./pages/Dashboard/UserManagementPage"; // Import the new page

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/track-service" element={<ServiceTrackingPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="service-entries" element={<ServiceMasukPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="service" element={<ServicePage />} />
            <Route path="installments" element={<InstallmentPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="users" element={<UserManagementPage />} /> {/* New route */}
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;