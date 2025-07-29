import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Dashboard/Master/ProductsPage';
import CustomersPage from './pages/Dashboard/Master/CustomersPage';
import SuppliersPage from './pages/Dashboard/Master/SuppliersPage';
import SalesPage from './pages/Dashboard/Transaction/SalesPage';
import ServiceEntryPage from './pages/Dashboard/Transaction/ServiceEntryPage';
import ServicePage from './pages/Dashboard/Transaction/ServicePage';
import SalesReportPage from './pages/Dashboard/Reports/SalesReportPage';
import ServiceReportPage from './pages/Dashboard/Reports/ServiceReportPage';
import InstallmentReportPage from './pages/Dashboard/Reports/InstallmentReportPage';
import ServicesInProgressPage from './pages/Dashboard/Reports/ServicesInProgressPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/dashboard/master/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
          <Route path="/dashboard/master/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
          <Route path="/dashboard/master/suppliers" element={<PrivateRoute><SuppliersPage /></PrivateRoute>} />
          <Route path="/dashboard/transaction/sales" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
          <Route path="/dashboard/transaction/service-entry" element={<PrivateRoute><ServiceEntryPage /></PrivateRoute>} />
          <Route path="/dashboard/transaction/service" element={<PrivateRoute><ServicePage /></PrivateRoute>} />
          <Route path="/dashboard/reports/sales" element={<PrivateRoute><SalesReportPage /></PrivateRoute>} />
          <Route path="/dashboard/reports/service" element={<PrivateRoute><ServiceReportPage /></PrivateRoute>} />
          <Route path="/dashboard/reports/installments" element={<PrivateRoute><InstallmentReportPage /></PrivateRoute>} />
          <Route path="/dashboard/reports/services-in-progress" element={<PrivateRoute><ServicesInProgressPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;