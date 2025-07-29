import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LayoutDashboard, Package, ShoppingCart, Database, FileText, Users, UserCircle, Receipt, Wrench, CreditCard, ChevronDown, ClipboardPlus, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logoSrc from '/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Stok", icon: Package, path: "/dashboard/stock" },
  { name: "Service Masuk", icon: ClipboardPlus, path: "/dashboard/service-masuk" },
  { 
    name: "Transaksi", 
    icon: Receipt,
    path: "/dashboard/transaction", // Base path for active state
    subItems: [
        { name: "Penjualan", icon: ShoppingCart, path: "/dashboard/transaction/sales" },
        { name: "Jasa Service", icon: Wrench, path: "/dashboard/transaction/service" },
        { name: "Kelola Cicilan", icon: CreditCard, path: "/dashboard/transaction/installments" },
    ]
  },
  { 
    name: "Data", 
    icon: Database, 
    path: "/dashboard/data",
    subItems: [
        { name: "Pelanggan", icon: Users, path: "/dashboard/data/customers" },
        { name: "Supplier", icon: Truck, path: "/dashboard/data/suppliers" },
    ]
  },
  { name: "Laporan", icon: FileText, path: "/dashboard/reports" },
  { name: "Users", icon: Users, path: "/dashboard/users" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const renderNavLinks = () => (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => {
        if (item.name === "Users" && profile?.role !== 'Admin') return null;
        return item.subItems ? (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("text-primary-foreground hover:bg-black/10", location.pathname.startsWith(item.path) && "bg-black/20")}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {item.subItems.map(subItem => (
                <DropdownMenuItem key={subItem.name} asChild>
                  <Link to={subItem.path} className="flex items-center gap-2 cursor-pointer">
                    <subItem.icon className="h-4 w-4" />
                    {subItem.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button key={item.name} variant="ghost" asChild className={cn("text-primary-foreground hover:bg-black/10", location.pathname === item.path && "bg-black/20")}>
            <Link to={item.path!} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        )
      })}
    </nav>
  );

  const renderMobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-primary text-primary-foreground p-4">
        <div className="mb-6">
          <img src={logoSrc} alt="CELLKOM Logo" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            if (item.name === "Users" && profile?.role !== 'Admin') return null;
            return item.subItems ? (
              <Collapsible key={item.name}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-primary-foreground hover:bg-black/10">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1 mt-1">
                  {item.subItems.map(subItem => (
                    <Button key={subItem.name} variant="ghost" asChild className="w-full justify-start text-primary-foreground hover:bg-black/10">
                      <Link to={subItem.path} className="flex items-center gap-2">
                        <subItem.icon className="h-4 w-4" />
                        {subItem.name}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button key={item.name} variant="ghost" asChild className="justify-start text-primary-foreground hover:bg-black/10">
                <Link to={item.path!} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && renderMobileNav()}
          <Link to="/dashboard">
            <img src={logoSrc} alt="CELLKOM Logo" className="h-10 w-auto" />
          </Link>
        </div>
        {!isMobile && renderNavLinks()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-primary-foreground hover:bg-black/10">
              <UserCircle className="h-6 w-6" />
              <span className="hidden md:inline">{profile?.full_name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              Log out
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