import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LoginPage from "./pages/Auth/LoginPage";
import MemberLoginPage from "./pages/Auth/MemberLoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import { NewsProvider } from "./hooks/use-news";
import { StockProvider } from "./hooks/use-stock";

function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <StockProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/berita" element={<NewsPage />} />
                <Route path="/berita/:slug" element={<NewsDetailPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/member-login" element={<MemberLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
            <Toaster />
          </ThemeProvider>
        </StockProvider>
      </NewsProvider>
    </AuthProvider>
  )
}

export default App