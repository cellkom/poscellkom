import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/use-auth';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CashierPage from './pages/Dashboard/CashierPage';
import StockPage from './pages/Dashboard/StockPage';
import StorePage from './pages/Dashboard/StorePage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import CustomersPage from './pages/Dashboard/CustomersPage';
import SuppliersPage from './pages/Dashboard/SuppliersPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import ItPage from './pages/Dashboard/ItPage';
import InfoServicePage from './pages/Dashboard/InfoServicePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/overview" replace />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/overview" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/cashier" element={<ProtectedRoute><CashierPage /></ProtectedRoute>} />
          <Route path="/dashboard/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
          <Route path="/dashboard/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/dashboard/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/it" element={<ProtectedRoute><ItPage /></ProtectedRoute>} />
          <Route path="/dashboard/info-service" element={<ProtectedRoute><InfoServicePage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;