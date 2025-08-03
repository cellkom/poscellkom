import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LayoutDashboard, Package, ShoppingCart, Database, FileText, Users, UserCircle, Receipt, Wrench, CreditCard, ChevronDown, ClipboardPlus, Truck, Newspaper } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logoSrc from '/logo.png';
import type { ReactNode, ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface NavSubItem {
    name: string;
    icon: IconType;
    path: string;
}

interface NavItem {
    name: string;
    icon: IconType;
    path: string;
    subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
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
        { name: "Users", icon: Users, path: "/dashboard/data/users" },
        { name: "Members", icon: UserCircle, path: "/dashboard/data/members" },
    ]
  },
  { name: "Laporan", icon: FileText, path: "/dashboard/reports" },
  { name: "Manajemen Berita", icon: Newspaper, path: "/dashboard/news" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const renderNavLinks = (isMobileNav = false) => {
    const nav = navItems.map((item) => {
      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(subItem => {
            if (subItem.path === '/dashboard/data/users' || subItem.path === '/dashboard/data/members') {
                return profile?.role === 'Admin';
            }
            return true;
        });
        if (visibleSubItems.length === 0) return null;

        return isMobileNav ? (
          <Collapsible key={item.name}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-background/20">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-1 mt-1">
              {visibleSubItems.map(subItem => (
                <Button key={subItem.name} variant="ghost" asChild className="w-full justify-start hover:bg-background/20">
                  <Link to={subItem.path} className="flex items-center gap-2">
                    <subItem.icon className="h-4 w-4" />
                    {subItem.name}
                  </Link>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("hover:bg-primary-foreground/10", location.pathname.startsWith(item.path) && "bg-primary-foreground/10")}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {visibleSubItems.map(subItem => (
                <DropdownMenuItem key={subItem.name} asChild>
                  <Link to={subItem.path} className="flex items-center gap-2 cursor-pointer">
                    <subItem.icon className="h-4 w-4" />
                    {subItem.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      if (item.path === '/dashboard/reports' || item.path === '/dashboard/news') {
          if (profile?.role !== 'Admin') return null;
      }

      return (
        <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", isMobileNav && "justify-start")}>
          <Link to={item.path!} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        </Button>
      );
    });
    return nav;
  };

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <div className="mb-6">
                    <Link to="/" className="flex items-center gap-3">
                      <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
                      <div>
                        <h1 className="text-lg font-bold text-primary font-poppins">Cellkom.Store</h1>
                        <p className="text-xs text-muted-foreground -mt-1">Pusat Service HP dan Komputer</p>
                      </div>
                    </Link>
                  </div>
                  <nav className="flex flex-col space-y-1">{renderNavLinks(true)}</nav>
                </SheetContent>
              </Sheet>
            )}
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-primary font-poppins">Cellkom.Store</h1>
                <p className="text-xs text-muted-foreground -mt-1">Pusat Service HP dan Komputer</p>
              </div>
            </Link>
          </div>
          {!isMobile && <nav className="hidden md:flex items-center space-x-1">{renderNavLinks()}</nav>}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6" />
                  <span className="hidden md:inline">{profile?.full_name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;