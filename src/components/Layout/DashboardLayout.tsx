import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ClipboardList,
  Truck,
  CreditCard,
  Newspaper, // Added Newspaper icon for News Management
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isMobileNav?: boolean;
  onLinkClick?: () => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Produk", path: "/dashboard/products", icon: Package },
  { name: "Penjualan", path: "/dashboard/sales", icon: ShoppingCart },
  { name: "Pelanggan", path: "/dashboard/customers", icon: Users },
  { name: "Pemasok", path: "/dashboard/suppliers", icon: Truck },
  { name: "Service Masuk", path: "/dashboard/service-entries", icon: ClipboardList },
  { name: "Pembayaran Cicilan", path: "/dashboard/installments", icon: CreditCard },
  { name: "Manajemen Berita", path: "/dashboard/news", icon: Newspaper }, // New item for News Management
  { name: "Pengaturan", path: "/dashboard/settings", icon: Settings },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, isMobileNav = false, onLinkClick }) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    // Optionally redirect to login or show a loading state
    return null;
  }

  return (
    <div className={cn("flex h-full", isMobileNav ? "flex-col" : "flex-row")}>
      <aside className={cn(
        "bg-primary-foreground text-primary-foreground-foreground border-r",
        isMobileNav ? "w-full p-4" : "w-64 p-6"
      )}>
        <h2 className={cn("text-2xl font-bold mb-6", isMobileNav && "text-center")}>POS Cellkom</h2>
        <ScrollArea className={cn(isMobileNav ? "h-[calc(100vh-120px)]" : "h-[calc(100vh-120px)]")}>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button key={item.name} variant="ghost" asChild className={cn("w-full justify-start hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", isMobileNav && "justify-start")}>
                <Link to={item.path!} className="flex items-center gap-2" onClick={onLinkClick}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <main className={cn("flex-1 overflow-auto p-6", isMobileNav && "p-4")}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;