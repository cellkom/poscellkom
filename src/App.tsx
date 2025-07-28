import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Auth/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import StockPage from "./pages/Dashboard/StockPage";
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import SalesPage from "./pages/Dashboard/Transaction/SalesPage";
import ServicePage from "./pages/Dashboard/Transaction/ServicePage";
import InstallmentPage from "./pages/Dashboard/Transaction/InstallmentPage";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import SalesReportPage from "./pages/Dashboard/Reports/SalesReportPage";
import ServiceReportPage from "./pages/Dashboard/Reports/ServiceReportPage";
import CustomerPage from "./pages/Dashboard/Data/CustomerPage";
import SupplierPage from "./pages/Dashboard/Data/SupplierPage";
import UsersPage from "./pages/Dashboard/UsersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/stock" element={<StockPage />} />
              <Route path="/dashboard/service-masuk" element={<ServiceMasukPage />} />
              <Route path="/dashboard/transaction/sales" element={<SalesPage />} />
              <Route path="/dashboard/transaction/service" element={<ServicePage />} />
              <Route path="/dashboard/transaction/installments" element={<InstallmentPage />} />
              <Route path="/dashboard/reports" element={<ReportsPage />} />
              <Route path="/dashboard/reports/sales" element={<SalesReportPage />} />
              <Route path="/dashboard/reports/service" element={<ServiceReportPage />} />
              <Route path="/dashboard/data/customers" element={<CustomerPage />} />
              <Route path="/dashboard/data/suppliers" element={<SupplierPage />} />
              
              {/* Admin Only Route */}
              <Route element={<AdminRoute />}>
                <Route path="/dashboard/users" element={<UsersPage />} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;