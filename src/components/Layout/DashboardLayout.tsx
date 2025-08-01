"use client";

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wrench,
  BarChart2,
  Users,
  Truck,
  Repeat,
  Menu,
  LogOut,
  UserCircle,
  ClipboardList,
  Settings,
} from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Transaksi',
      icon: ShoppingCart,
      subItems: [
        { name: 'Kasir Penjualan', path: '/dashboard/transaction/sales', icon: ShoppingCart },
        { name: 'Kasir Service', path: '/dashboard/transaction/service', icon: Wrench },
        { name: 'Data Service Masuk', path: '/dashboard/service-masuk', icon: ClipboardList },
        { name: 'Manajemen Cicilan', path: '/dashboard/transaction/installments', icon: Repeat },
      ],
    },
    {
      name: 'Manajemen Data',
      icon: Package,
      subItems: [
        { name: 'Stok Barang', path: '/dashboard/stock', icon: Package },
        { name: 'Data Pelanggan', path: '/dashboard/data/customers', icon: Users },
        { name: 'Data Supplier', path: '/dashboard/data/suppliers', icon: Truck },
      ],
    },
    { name: 'Laporan', path: '/dashboard/reports', icon: BarChart2 },
  ];

  const adminNavItems = [
    { name: 'Manajemen User', path: '/dashboard/users', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-2">
      <Accordion type="multiple" className="w-full" defaultValue={['transaksi-item', 'manajemen-data-item']}>
        {navItems.map((item) =>
          item.subItems ? (
            <AccordionItem value={`${item.name.toLowerCase().replace(' ', '-')}-item`} key={item.name} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 text-white/80 hover:text-white data-[state=open]:bg-primary-foreground/10">
                <div className="flex items-center gap-2 font-semibold">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 pt-1 flex flex-col gap-1">
                {item.subItems.map((subItem) => (
                  <Button key={subItem.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10 justify-start", location.pathname === subItem.path && "bg-primary-foreground/10 text-white")}>
                    <Link to={subItem.path!} className="flex items-center gap-2">
                      <subItem.icon className="h-4 w-4" />
                      {subItem.name}
                    </Link>
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10 justify-start font-semibold", location.pathname === item.path && "bg-primary-foreground/10 text-white")}>
              <Link to={item.path!} className="flex items-center gap-3 px-3 py-2">
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          )
        )}
        {profile?.role === 'Admin' && (
          <>
            <div className="my-2 border-t border-gray-700"></div>
            {adminNavItems.map((item) => (
              <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10 justify-start font-semibold", location.pathname === item.path && "bg-primary-foreground/10 text-white")}>
                <Link to={item.path!} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </>
        )}
      </Accordion>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
        <Link to="/dashboard" className="flex items-center justify-center h-16 border-b border-gray-700">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
          <h1 className="text-xl font-bold text-white">Cellkom</h1>
        </Link>
        <NavContent />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 md:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 text-white p-0 w-64">
              <Link to="/dashboard" className="flex items-center justify-center h-16 border-b border-gray-700">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
                <h1 className="text-xl font-bold text-white">Cellkom</h1>
              </Link>
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    <UserCircle />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{profile?.full_name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile?.role === 'Admin' && (
                <DropdownMenuItem onClick={() => navigate('/dashboard/users')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Manajemen User</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;