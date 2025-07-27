import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LayoutDashboard, Package, ShoppingCart, Database, FileText, Users, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Stok", icon: Package, path: "/dashboard/stock" },
    { name: "Penjualan", icon: ShoppingCart, path: "/dashboard/sales" },
    { name: "Data", icon: Database, path: "/dashboard/data" },
    { name: "Laporan", icon: FileText, path: "/dashboard/reports" },
    { name: "Users", icon: Users, path: "/dashboard/users" },
  ];

  const renderNavLinks = () => (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => (
        <Button key={item.name} variant="ghost" asChild className="text-white hover:bg-blue-700 hover:text-white">
          <Link to={item.path} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        </Button>
      ))}
    </nav>
  );

  const renderMobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-blue-800 text-white p-4">
        <div className="text-2xl font-bold mb-6">MB.PONSEL</div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Button key={item.name} variant="ghost" asChild className="justify-start text-white hover:bg-blue-700 hover:text-white">
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && renderMobileNav()}
          <Link to="/dashboard" className="text-2xl font-bold">MB.PONSEL</Link>
        </div>
        {!isMobile && renderNavLinks()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-blue-700 hover:text-white">
              <UserCircle className="h-6 w-6" />
              <span className="hidden md:inline">admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-grow p-4 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;