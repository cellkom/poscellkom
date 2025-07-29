import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <Router>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </Router>
);