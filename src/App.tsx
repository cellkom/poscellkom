import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import DashboardLayout from "./components/Layout/DashboardLayout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProductsPage from "./pages/Dashboard/ProductsPage";
import CustomersPage from "./pages/Dashboard/CustomersPage";
import ServiceMasukPage from "./pages/Dashboard/ServiceMasukPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import ServiceTrackingPage from "./pages/ServiceTrackingPage";
import NewsManagementPage from "./pages/Dashboard/NewsManagementPage"; // New import
import NewsFormPage from "./pages/Dashboard/NewsFormPage"; // New import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track-service" element={<ServiceTrackingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="service-masuk" element={<ServiceMasukPage />} />
          <Route path="news" element={<NewsManagementPage />} /> {/* New route */}
          <Route path="news/new" element={<NewsFormPage />} /> {/* New route */}
          <Route path="news/edit/:id" element={<NewsFormPage />} /> {/* New route */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;