import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, ShoppingCart, Users, Settings, Menu, X, Truck, Wrench, DollarSign, CreditCard, BarChart, User, LayoutDashboard, Package2, ReceiptText, Scale, HandCoins, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Produk", path: "/products", icon: Package },
  { name: "Penjualan", path: "/sales", icon: ShoppingCart },
  { name: "Pelanggan", path: "/customers", icon: Users },
  { name: "Supplier", path: "/suppliers", icon: Truck },
  { name: "Service Masuk", path: "/service-entries", icon: Wrench },
  { name: "Transaksi Service", path: "/service-transactions", icon: ReceiptText },
  { name: "Pembayaran", path: "/payments", icon: DollarSign },
  { name: "Angsuran", path: "/installments", icon: CreditCard },
  { name: "Laporan", path: "/reports", icon: BarChart },
  { name: "Pengaturan", path: "/settings", icon: Settings },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Berhasil keluar!");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Gagal keluar. Silakan coba lagi.");
    }
  };

  const renderNavItems = (isMobileNav = false) => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={() => {
            navigate(item.path!);
            if (isMobileNav) setIsMobileNavOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            location.pathname === item.path && "bg-muted text-primary",
            isMobileNav && "justify-start"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">POSCellkom</span>
            </Link>
          </div>
          <div className="flex-1">
            {renderNavItems()}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">POSCellkom</span>
                </Link>
                {renderNavItems(true)}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search or other header content can go here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt="User Avatar" />
                  <AvatarFallback>{user?.full_name ? user.full_name.charAt(0) : <User className="h-5 w-5" />}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.full_name || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/support")}>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;