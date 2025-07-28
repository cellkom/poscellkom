import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Package,
  Users,
  Truck,
  FileText,
  Settings,
  UserCog,
  ClipboardPlus,
  Banknote,
} from "lucide-react";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation();
  const { profile } = useAuth();

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      label: "Transaksi",
      isTitle: true,
    },
    { href: "/dashboard/transaction/sales", label: "Penjualan", icon: ShoppingCart },
    { href: "/dashboard/transaction/service", label: "Pembayaran Service", icon: Wrench },
    { href: "/dashboard/service-masuk", label: "Penerimaan Service", icon: ClipboardPlus },
    { href: "/dashboard/transaction/installments", label: "Cicilan", icon: Banknote },
    {
      label: "Master Data",
      isTitle: true,
    },
    { href: "/dashboard/stock", label: "Stok Barang", icon: Package },
    { href: "/dashboard/data/customers", label: "Pelanggan", icon: Users },
    { href: "/dashboard/data/suppliers", label: "Supplier", icon: Truck },
    {
      label: "Lainnya",
      isTitle: true,
    },
    { href: "/dashboard/reports", label: "Laporan", icon: FileText },
    ...(profile?.role === 'Admin'
      ? [{ href: "/dashboard/users", label: "Manajemen User", icon: UserCog }]
      : []),
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <nav
      className={cn("flex flex-col gap-1 p-2", className)}
      {...props}
    >
      {routes.map((route, index) =>
        route.isTitle ? (
          <h3 key={index} className="px-4 pt-4 pb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            {route.label}
          </h3>
        ) : (
          <Link
            key={index}
            to={route.href!}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              location.pathname === route.href && "bg-muted text-primary"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        )
      )}
    </nav>
  );
}