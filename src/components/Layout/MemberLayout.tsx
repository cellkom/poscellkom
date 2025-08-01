import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserCircle, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoSrc from '/logo.png';
import { ThemeToggle } from "../ThemeToggle";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/member/home" className="flex items-center gap-3">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-primary font-poppins">Cellkom.Store</h1>
              <p className="text-xs text-muted-foreground -mt-1">Member Area</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link to="/member/cart">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Cart
                    </Link>
                </Button>
            </nav>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6" />
                  <span>{profile?.full_name || 'Member'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Pesanan Saya</DropdownMenuItem>
                <DropdownMenuItem>Profil</DropdownMenuItem>
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
      <footer className="py-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cellkom.Store. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default MemberLayout;