import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, CircleUser, Home, Package, Users, Users2, Truck, ShoppingCart, Wrench, CreditCard, Newspaper, Settings } from 'lucide-react';
import logoSrc from '/logo.png';

const DashboardLayout = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/sales', label: 'Penjualan', icon: ShoppingCart, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/services', label: 'Servis', icon: Wrench, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/installments', label: 'Cicilan', icon: CreditCard, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/products', label: 'Produk', icon: Package, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/customers', label: 'Pelanggan', icon: Users2, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck, roles: ['Admin', 'Kasir'] },
    { href: '/dashboard/users', label: 'Manajemen User', icon: Users, roles: ['Admin'] },
    { href: '/dashboard/news', label: 'Manajemen Berita', icon: Newspaper, roles: ['Admin'] },
    { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings, roles: ['Admin'] },
  ];

  const accessibleNavLinks = navLinks.filter(link => profile && link.roles.includes(profile.role));

  const NavContent = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {accessibleNavLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          to={href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
              <span className="">Cellkom.Store</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavContent />
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
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
                  <span className="">Cellkom.Store</span>
                </Link>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Optional: Add search bar or other header elements here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.full_name || user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                Log out
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
};

export default DashboardLayout;