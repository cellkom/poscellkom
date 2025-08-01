import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, ShoppingCart, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import logoSrc from '/logo.png';
import { ThemeToggle } from "../ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/member/home" className="flex items-center gap-3">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-primary font-poppins">Cellkom.Store</h1>
              <p className="text-xs text-muted-foreground -mt-1">Member Area</p>
            </div>
          </Link>
          <nav className="flex items-center space-x-2">
             <Button variant="ghost" asChild>
                <Link to="/member/home" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden md:inline">Home</span>
                </Link>
             </Button>
             <Button variant="ghost" asChild>
                <Link to="/member/orders" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden md:inline">Pesanan Saya</span>
                </Link>
             </Button>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/member/cart" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6" />
                  <span className="hidden md:inline">{profile?.full_name || 'Member'}</span>
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

export default MemberLayout;