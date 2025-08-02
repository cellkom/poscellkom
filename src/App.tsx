import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import PublicPage from "./pages/PublicPage";
import LoginPage from "./pages/Auth/LoginPage";
import MemberLoginPage from "./pages/Auth/MemberLoginPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import ProductsPage from "./pages/ProductsPage"; // Public products page
import NewsPage from "./pages/NewsPage"; // Public news list page
import NewsDetailPage from "./pages/NewsDetailPage"; // Public news detail page
import ServiceTrackingPage from "./pages/ServiceTrackingPage";
import NotFound from "./pages/NotFound"; // Assuming you have a NotFound page

import DashboardLayout from "./components/Layout/DashboardLayout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import StockPage from "./pages/Dashboard/StockPage"; // Corrected import for products in dashboard
import CustomerPage from "./pages/Dashboard/Data/CustomerPage"; // Corrected import for customers in dashboard
import SupplierPage from "./pages/Dashboard/Data/SupplierPage"; // Added SupplierPage
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import SalesPage from "./pages/Dashboard/Transaction/SalesPage"; // Added SalesPage
import ServicePage from "./pages/Dashboard/Transaction/ServicePage"; // Added ServicePage
import InstallmentPage from "./pages/Dashboard/Transaction/InstallmentPage"; // Added InstallmentPage
import AddInstallmentPage from "./pages/Dashboard/Transaction/AddInstallmentPage"; // Added AddInstallmentPage
import SalesReportPage from "./pages/Dashboard/Reports/SalesReportPage"; // Added SalesReportPage
import ServiceReportPage from "./pages/Dashboard/Reports/ServiceReportPage"; // Added ServiceReportPage
import TodayReportPage from "./pages/Dashboard/Reports/TodayReportPage"; // Added TodayReportPage
import ServicesInProgressPage from "./pages/Dashboard/ServicesInProgressPage"; // Added ServicesInProgressPage
import UsersPage from "./pages/Dashboard/UsersPage"; // Added UsersPage
import NewsManagementPage from "./pages/Dashboard/NewsManagementPage";
import NewsFormPage from "./pages/Dashboard/NewsFormPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Assuming ProtectedRoute exists

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/track-service" element={<ServiceTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/member-login" element={<MemberLoginPage />} />
        
        {/* Protected Routes for Members */}
        <Route element={<ProtectedRoute />}>
          <Route path="/member-profile" element={<MemberProfilePage />} />
        </Route>

        {/* Protected Routes for Staff/Admin (Dashboard) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="stock" element={<StockPage />} /> {/* Renamed from products to stock */}
            <Route path="customers" element={<CustomerPage />} />
            <Route path="suppliers" element={<SupplierPage />} /> {/* Added SupplierPage */}
            <Route path="service-masuk" element={<ServiceMasukPage />} />
            <Route path="transaction/sales" element={<SalesPage />} /> {/* Added SalesPage */}
            <Route path="transaction/service" element={<ServicePage />} /> {/* Added ServicePage */}
            <Route path="transaction/installments" element={<InstallmentPage />} /> {/* Added InstallmentPage */}
            <Route path="transaction/add-installment" element={<AddInstallmentPage />} /> {/* Added AddInstallmentPage */}
            <Route path="reports" element={<SalesReportPage />} /> {/* Changed to SalesReportPage, assuming it's the main reports page */}
            <Route path="reports/sales" element={<SalesReportPage />} />
            <Route path="reports/service" element={<ServiceReportPage />} />
            <Route path="reports/today" element={<TodayReportPage />} />
            <Route path="services-in-progress" element={<ServicesInProgressPage />} />
            <Route path="users" element={<UsersPage />} /> {/* Added UsersPage */}
            <Route path="news" element={<NewsManagementPage />} />
            <Route path="news/new" element={<NewsFormPage />} />
            <Route path="news/edit/:id" element={<NewsFormPage />} />
            <Route path="profile" element={<UserProfilePage />} /> {/* Staff profile page */}
            {/* Removed settings route as it's not provided */}
          </Route>
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;