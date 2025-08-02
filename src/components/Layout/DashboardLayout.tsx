import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom"; // Import Outlet
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Package, Users, Settings, BarChart, Wrench, Newspaper } from "lucide-react"; // Added Newspaper icon

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Produk",
    path: "/dashboard/stock", // Corrected path to stock
    icon: Package,
  },
  {
    name: "Pelanggan",
    path: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Service Masuk",
    path: "/dashboard/service-masuk",
    icon: Wrench,
  },
  {
    name: "Manajemen Berita",
    path: "/dashboard/news",
    icon: Newspaper,
  },
  {
    name: "Pengaturan",
    path: "/dashboard/settings",
    icon: Settings,
  },
];

// Removed DashboardLayoutProps interface as children are handled by Outlet
const DashboardLayout: React.FC = () => { // Removed children from props
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNav] = useState(false); // Renamed state variable for consistency

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <BarChart className="h-6 w-6" />
              <span className="">POS System</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10")}>
                  <Link to={item.path!} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNav}>
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
                <Link to="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <BarChart className="h-6 w-6" />
                  <span className="sr-only">POS System</span>
                </Link>
                {navItems.map((item) => (
                  <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", "justify-start")} onClick={() => setIsMobileNav(false)}>
                    <Link to={item.path!} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search or other header content */}
          </div>
          {/* User menu or other header actions */}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;