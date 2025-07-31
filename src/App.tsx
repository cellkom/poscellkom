import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthProvider from '@/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import Index from './pages/Index';
import Laporan from './pages/Laporan';
import Login from './pages/Login';
import ManajemenUser from './pages/ManajemenUser';
import Pelanggan from './pages/Pelanggan';
import Produk from './pages/Produk';
import Service from './pages/Service';
import Supplier from './pages/Supplier';
import Transaksi from './pages/Transaksi';
import Hutang from './pages/Hutang';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/transaksi" element={<Transaksi />} />
                      <Route path="/produk" element={<Produk />} />
                      <Route path="/pelanggan" element={<Pelanggan />} />
                      <Route path="/supplier" element={<Supplier />} />
                      <Route path="/service" element={<Service />} />
                      <Route path="/laporan" element={<Laporan />} />
                      <Route path="/manajemen-user" element={<ManajemenUser />} />
                      <Route path="/hutang" element={<Hutang />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </DashboardLayout>
                }
              />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;