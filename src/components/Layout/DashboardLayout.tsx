import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Package, Users, Building, ShoppingCart, Wrench, FileText, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({ master: false, transaction: false, reports: false });

  const toggleMenu = (menu: 'master' | 'transaction' | 'reports') => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    {
      label: 'Data Master',
      icon: Package,
      menuKey: 'master',
      subItems: [
        { href: '/dashboard/master/products', label: 'Data Barang' },
        { href: '/dashboard/master/customers', label: 'Data Customer' },
        { href: '/dashboard/master/suppliers', label: 'Data Supplier' },
      ],
    },
    {
      label: 'Transaksi',
      icon: ShoppingCart,
      menuKey: 'transaction',
      subItems: [
        { href: '/dashboard/transaction/sales', label: 'Transaksi Penjualan' },
        { href: '/dashboard/transaction/service-entry', label: 'Penerimaan Servis' },
        { href: '/dashboard/transaction/service', label: 'Transaksi Servis' },
      ],
    },
    {
      label: 'Laporan',
      icon: FileText,
      menuKey: 'reports',
      subItems: [
        { href: '/dashboard/reports/sales', label: 'Laporan Penjualan' },
        { href: '/dashboard/reports/service', label: 'Laporan Servis' },
        { href: '/dashboard/reports/installments', label: 'Laporan Piutang' },
        { href: '/dashboard/reports/services-in-progress', label: 'Servis Dalam Proses' },
      ],
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile ? "gap-2" : "gap-1")}>
      {navItems.map((item) =>
        item.subItems ? (
          <div key={item.label}>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => toggleMenu(item.menuKey as 'master' | 'transaction' | 'reports')}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {openMenus[item.menuKey as keyof typeof openMenus] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {openMenus[item.menuKey as keyof typeof openMenus] && (
              <div className="pl-8 flex flex-col gap-1 mt-1">
                {item.subItems.map(subItem => (
                  <Link
                    key={subItem.href}
                    to={subItem.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      isActive(subItem.href) && 'text-primary bg-muted'
                    )}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            key={item.href}
            to={item.href!}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive(item.href!) && 'text-primary bg-muted'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      )}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Wrench className="h-6 w-6" />
              <span className="">CellKom</span>
            </Link>
          </div>
          <div className="flex-1">
            {renderNavLinks()}
          </div>
          <div className="mt-auto p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm font-semibold">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Kasir</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
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
              {renderNavLinks(true)}
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Optional: Add search or other header content here */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;