"use client";

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
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
  Settings,
  Users,
  Truck,
  Repeat,
  Menu,
  LogOut,
  UserCircle,
  ChevronDown,
} from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Kasir', path: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Stok', path: '/dashboard/stock', icon: Package },
  { name: 'Servis', path: '/dashboard/service', icon: Wrench },
  { name: 'Cicilan', path: '/dashboard/installments', icon: Repeat },
  { name: 'Laporan', path: '/dashboard/reports', icon: BarChart2 },
  {
    name: 'Manajemen',
    subItems: [
      { name: 'Pelanggan', path: '/dashboard/customers', icon: Users },
      { name: 'Supplier', path: '/dashboard/suppliers', icon: Truck },
    ],
  },
  { name: 'Pengaturan', path: '/dashboard/settings', icon: Settings },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Anda berhasil keluar.");
    navigate('/login');
  };

  const NavContent = ({ isMobileNav = false }: { isMobileNav?: boolean }) => (
    <nav className="flex flex-col gap-2 p-4">
      <Accordion type="multiple" className="w-full" defaultValue={['manajemen-item']}>
        {navItems.map((item) =>
          item.subItems ? (
            <AccordionItem value="manajemen-item" key={item.name} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-primary-foreground/10 text-white/80 hover:text-white data-[state=open]:bg-primary-foreground/10">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  {item.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 pt-2 flex flex-col gap-1">
                {item.subItems.map((subItem) => (
                  <Button key={subItem.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10 justify-start", location.pathname === subItem.path && "bg-primary-foreground/10")}>
                    <Link to={subItem.path!} className="flex items-center gap-2">
                      <subItem.icon className="h-4 w-4" />
                      {subItem.name}
                    </Link>
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", isMobileNav && "justify-start")}>
              <Link to={item.path!} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        )}
      </Accordion>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-2xl font-bold">ServisKuy</h1>
        </div>
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
              <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <h1 className="text-2xl font-bold">ServisKuy</h1>
              </div>
              <NavContent isMobileNav />
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
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
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