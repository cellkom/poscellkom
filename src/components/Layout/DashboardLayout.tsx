import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LayoutDashboard, Package, ShoppingCart, Database, FileText, Users, UserCircle, Receipt, Wrench, CreditCard, ChevronDown, ClipboardPlus, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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

  const renderNavLinks = () => (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => 
        item.subItems ? (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("text-white hover:bg-red-600 hover:text-white", location.pathname.startsWith(item.path) && "bg-red-700")}>
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
          <Button key={item.name} variant="ghost" asChild className={cn("text-white hover:bg-red-600 hover:text-white", location.pathname === item.path && "bg-red-700")}>
            <Link to={item.path!} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        )
      )}
    </nav>
  );

  const renderMobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-gray-900 text-white p-4">
        <div className="text-2xl font-bold mb-6">CELLKOM</div>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => 
            item.subItems ? (
              <Collapsible key={item.name}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-white hover:bg-red-600 hover:text-white">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1 mt-1">
                  {item.subItems.map(subItem => (
                    <Button key={subItem.name} variant="ghost" asChild className="w-full justify-start text-white hover:bg-red-600 hover:text-white">
                      <Link to={subItem.path} className="flex items-center gap-2">
                        <subItem.icon className="h-4 w-4" />
                        {subItem.name}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button key={item.name} variant="ghost" asChild className="justify-start text-white hover:bg-red-600 hover:text-white">
                <Link to={item.path!} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && renderMobileNav()}
          <Link to="/dashboard" className="text-2xl font-bold">CELLKOM</Link>
        </div>
        {!isMobile && renderNavLinks()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-red-600 hover:text-white">
              <UserCircle className="h-6 w-6" />
              <span className="hidden md:inline">admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login" className="cursor-pointer">Log out</Link>
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