import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2, Home, ShoppingCart, Package, Users, LineChart, Settings, Wrench, CreditCard, Landmark, Newspaper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  path: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home, roles: ['Admin', 'Kasir'] },
  { name: "Penjualan", path: "/sales", icon: ShoppingCart, roles: ['Admin', 'Kasir'] },
  { name: "Produk", path: "/products", icon: Package, roles: ['Admin', 'Kasir'] },
  { name: "Pelanggan", path: "/customers", icon: Users, roles: ['Admin', 'Kasir'] },
  { name: "Pemasok", path: "/suppliers", icon: Landmark, roles: ['Admin', 'Kasir'] },
  { name: "Servis Masuk", path: "/service-entries", icon: Wrench, roles: ['Admin', 'Kasir'] },
  { name: "Transaksi Servis", path: "/service-transactions", icon: LineChart, roles: ['Admin', 'Kasir'] },
  { name: "Angsuran", path: "/installments", icon: CreditCard, roles: ['Admin', 'Kasir'] },
  { name: "Pengaturan", path: "/settings", icon: Settings, roles: ['Admin'] },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; // If no roles specified, accessible by all authenticated users
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">POSCellkom</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {filteredNavItems.map((item) => (
                <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10")}>
                  <Link to={item.path!} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
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
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">POSCellkom</span>
                </Link>
                {filteredNavItems.map((item) => (
                  <Button key={item.name} variant="ghost" asChild className={cn("hover:bg-primary-foreground/10", location.pathname === item.path && "bg-primary-foreground/10", "justify-start")}>
                    <Link to={item.path!} className="flex items-center gap-2" onClick={() => setIsMobileNavOpen(false)}>
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search or other header content */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt="Avatar" />
                  <AvatarFallback>{user?.full_name ? user.full_name.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.full_name || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Settings clicked")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Support clicked")}>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}