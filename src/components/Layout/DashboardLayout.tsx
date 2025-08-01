import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import {
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  BarChart,
  Users,
  Truck,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Wrench,
  HardDrive,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Kasir', path: '/dashboard/cashier', icon: ShoppingCart },
  { name: 'Stok', path: '/dashboard/stock', icon: Package },
  {
    name: 'Layanan',
    icon: Wrench,
    children: [
      { name: 'Toko', path: '/dashboard/store', icon: Store },
      { name: 'Info Service', path: '/dashboard/info-service', icon: Info },
      { name: 'IT', path: '/dashboard/it', icon: HardDrive },
    ],
  },
  { name: 'Laporan', path: '/dashboard/reports', icon: BarChart },
  { name: 'Pelanggan', path: '/dashboard/customers', icon: Users },
  { name: 'Supplier', path: '/dashboard/suppliers', icon: Truck },
  { name: 'Pengaturan', path: '/dashboard/settings', icon: Settings },
];

const getInitials = (name: string) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
};

const NavContent = ({ isMobileNav = false }: { isMobileNav?: boolean }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    const activeParent = navItems.find(item => item.children?.some(child => child.path === location.pathname));
    return activeParent?.name || null;
  });

  return (
    <nav className="flex flex-col gap-2 px-4">
      {navItems.map((item) =>
        item.children ? (
          <Collapsible key={item.name} open={openMenu === item.name} onOpenChange={() => setOpenMenu(openMenu === item.name ? null : item.name)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between hover:bg-primary-foreground/10",
                  item.children.some(child => location.pathname === child.path) && "bg-primary-foreground/10",
                  isMobileNav && "justify-start"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pt-2 flex flex-col gap-1">
              {item.children.map((child) => (
                <Button key={child.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === child.path && "bg-primary-foreground/10", "justify-start")}>
                  <Link to={child.path!} className="flex items-center gap-2">
                    <child.icon className="h-4 w-4" />
                    {child.name}
                  </Link>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", isMobileNav && "justify-start")}>
            <Link to={item.path!} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        )
      )}
    </nav>
  );
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-primary text-primary-foreground md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-primary-foreground/20 px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">TokoKu</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
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
            <SheetContent side="left" className="flex flex-col bg-primary text-primary-foreground p-0">
              <div className="flex h-14 items-center border-b border-primary-foreground/20 px-4 lg:h-[60px] lg:px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Package className="h-6 w-6" />
                  <span className="">TokoKu</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <NavContent isMobileNav />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user?.email} />
                  <AvatarFallback>{getInitials(profile?.full_name || user?.email || '')}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-normal">
                  <p className="font-semibold">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profil</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Pengaturan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;