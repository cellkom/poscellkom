import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  Menu,
  DollarSign,
  Wrench,
  ArrowLeftRight,
  FileText,
  Warehouse,
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
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import NavLink from './NavLink';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'Produk' },
  { href: '/customers', icon: Users, label: 'Pelanggan' },
  { href: '/suppliers', icon: Warehouse, label: 'Supplier' },
  { href: '/sales', icon: DollarSign, label: 'Penjualan' },
  { href: '/services', icon: Wrench, label: 'Servis' },
  { href: '/installments', icon: FileText, label: 'Piutang' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
];

const adminNavItems = [{ href: '/settings', icon: Settings, label: 'Pengaturan' }];

export function DashboardLayout() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile(session?.user?.id);
  const { settings, loading: settingsLoading } = useAppSettings();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isLoading = sessionLoading || profileLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const allNavItems = profile?.role === 'Admin' ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">{settings?.nama_toko || 'Toko Anda'}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {allNavItems.map((item) => (
                <NavLink key={item.href} to={item.href} icon={item.icon} label={item.label} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Package className="h-6 w-6" />
                  <span className="">{settings?.nama_toko || 'Toko Anda'}</span>
                </Link>
                {allNavItems.map((item) => (
                  <NavLink key={item.href} to={item.href} icon={item.icon} label={item.label} isMobile />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">
              {allNavItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full flex items-center gap-2 px-3">
                <UserCircle className="h-6 w-6" />
                <span className="hidden md:inline">{session?.user?.email || 'User'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p>Signed in as</p>
                <p className="font-normal text-sm text-muted-foreground truncate">{session?.user?.email}</p>
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