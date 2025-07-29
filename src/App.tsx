import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Dashboard/Master/ProductsPage';
import CustomersPage from './pages/Dashboard/Master/CustomersPage';
import SuppliersPage from './pages/Dashboard/Master/SuppliersPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServiceEntryPage from './pages/Dashboard/Transaction/ServiceEntryPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import InstallmentReportPage from './pages/Dashboard/Reports/InstallmentReportPage';
import ServicesInProgressPage from './pages/Dashboard/Reports/ServicesInProgressPage';
import UsersPage from './pages/Dashboard/UsersPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="/dashboard/master/products" element={<ProductsPage />} />
        <Route path="/dashboard/master/customers" element={<CustomersPage />} />
        <Route path="/dashboard/master/suppliers" element={<SuppliersPage />} />
        
        <Route path="/dashboard/transaction/sales" element={<SalesPage />} />
        <Route path="/dashboard/transaction/service-entry" element={<ServiceEntryPage />} />
        <Route path="/dashboard/transaction/service" element={<ServicePage />} />
        
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/reports/sales" element={<SalesReportPage />} />
        <Route path="/dashboard/reports/service" element={<ServiceReportPage />} />
        <Route path="/dashboard/reports/installments" element={<InstallmentReportPage />} />
        <Route path="/dashboard/reports/services-in-progress" element={<ServicesInProgressPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/dashboard/users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;