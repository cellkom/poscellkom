import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Settings,
  ClipboardList,
  Wrench,
  CreditCard,
  DollarSign,
  UserCog, // Added for User Management
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Penjualan", path: "/dashboard/sales", icon: ShoppingCart },
  { name: "Produk", path: "/dashboard/products", icon: Package },
  { name: "Pemasok", path: "/dashboard/suppliers", icon: Users },
  { name: "Pelanggan", path: "/dashboard/customers", icon: Users },
  { name: "Servis Masuk", path: "/dashboard/service-entries", icon: ClipboardList },
  { name: "Servis", path: "/dashboard/service", icon: Wrench },
  { name: "Cicilan", path: "/dashboard/installments", icon: CreditCard },
  { name: "Pengguna", path: "/dashboard/users", icon: UserCog }, // New item for User Management
  { name: "Pengaturan", path: "/dashboard/settings", icon: Settings },
  { name: "Analitik", path: "/dashboard/analytics", icon: LineChart },
];

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      showError("Gagal keluar: " + error.message);
    } else {
      showSuccess("Berhasil keluar!");
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">POSCellkom</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    location.pathname === item.path
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Tingkatkan ke Pro</CardTitle>
                <CardContent className="p-2 pt-0 md:p-4 text-sm">
                  Dapatkan semua fitur baru dan akses tak terbatas ke dukungan kami.
                </CardContent>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4">
                <Button size="sm" className="w-full">
                  Tingkatkan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
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
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                      location.pathname === item.path
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    } hover:text-foreground`}
                    onClick={() => setIsOpen(false)} // Close sheet on click
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Tingkatkan ke Pro</CardTitle>
                    <CardDescription>
                      Dapatkan semua fitur baru dan akses tak terbatas ke dukungan kami.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Tingkatkan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search or other header content can go here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuItem>Dukungan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;