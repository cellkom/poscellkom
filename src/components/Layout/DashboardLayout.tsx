import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  LogOut,
  UserCircle,
  ChevronDown,
  Menu,
  DollarSign,
  Wrench,
  FileText,
  Warehouse,
  ClipboardList,
  BarChart3,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import NavLink from './NavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoSrc from '/logo.png';

const kasirNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dasbor' },
  { href: '/dashboard/transaction/sales', icon: DollarSign, label: 'Kasir Penjualan' },
  { href: '/dashboard/transaction/service', icon: Wrench, label: 'Kasir Service' },
  { href: '/dashboard/service-masuk', icon: ClipboardList, label: 'Service Masuk' },
  { href: '/dashboard/transaction/installments', icon: FileText, label: 'Piutang' },
];

const adminNavItems = [
  { href: '/dashboard/stock', icon: Package, label: 'Manajemen Stok' },
  { href: '/dashboard/data/customers', icon: Users, label: 'Data Pelanggan' },
  { href: '/dashboard/data/suppliers', icon: Warehouse, label: 'Data Supplier' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Laporan' },
  { href: '/dashboard/users', icon: UserCog, label: 'Manajemen User' },
];

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const navItems = profile?.role === 'Admin' ? [...kasirNavItems, ...adminNavItems] : kasirNavItems;
  
  const getPageTitle = () => {
    const allNavItems = [...kasirNavItems, ...adminNavItems];
    if (location.pathname === '/dashboard') return 'Dasbor';
    
    const matchingRoutes = allNavItems.filter(item => location.pathname.startsWith(item.href) && item.href !== '/dashboard');
    if (matchingRoutes.length > 0) {
      const bestMatch = matchingRoutes.reduce((a, b) => a.href.length > b.href.length ? a : b);
      return bestMatch.label;
    }
    
    return 'Halaman';
  };

  const SideNav = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <NavLink key={item.href} to={item.href} icon={item.icon} label={item.label} />
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
              <span className="">CELLKOM</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SideNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
                  <span className="">CELLKOM</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink key={item.href} to={item.href} icon={item.icon} label={item.label} isMobile />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full flex items-center gap-2 px-3">
                <UserCircle className="h-6 w-6" />
                <span className="hidden md:inline">{profile?.full_name || user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p>{profile?.full_name}</p>
                <p className="font-normal text-sm text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}