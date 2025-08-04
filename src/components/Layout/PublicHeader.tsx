import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, ShoppingCart, User, LogIn, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const PublicHeader = () => {
  const { settings } = useSettings();
  const { session, profile, signOut } = useAuth();
  const { cart } = useCart();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navLinks = [
    { to: "/", text: "Beranda" },
    { to: "/products", text: "Produk" },
    { to: "/tracking", text: "Info Servis" },
    { to: "/news", text: "Berita" },
    { to: "/#about", text: "Tentang Kami" },
    { to: "/#contact", text: "Kontak" },
  ];

  const closeSheet = () => setIsSheetOpen(false);

  const renderAuthButtons = (isMobile = false) => {
    const buttonSize = isMobile ? "default" : "icon";
    const buttonVariant = isMobile ? "outline" : "ghost";
    const className = isMobile ? "w-full justify-start gap-2" : "";

    if (session) {
      return (
        <>
          <Button variant={buttonVariant} size={buttonSize} className={className} asChild>
            <Link to={profile?.role === 'Member' ? "/member/dashboard" : "/dashboard"}>
              <User className="h-5 w-5" />
              <span className={isMobile ? 'inline' : 'sr-only'}>Dashboard</span>
            </Link>
          </Button>
          <Button variant={buttonVariant} size={buttonSize} className={className} onClick={signOut}>
            <LogOut className="h-5 w-5" />
            <span className={isMobile ? 'inline' : 'sr-only'}>Keluar</span>
          </Button>
        </>
      );
    }
    return (
      <Button variant={buttonVariant} size={buttonSize} className={className} asChild>
        <Link to="/login">
          <LogIn className="h-5 w-5" />
          <span className={isMobile ? 'inline' : 'sr-only'}>Masuk</span>
        </Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 mr-4" onClick={closeSheet}>
          {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto" />}
          <span className="font-bold text-lg hidden sm:inline-block truncate">{settings.appName || 'Cellkom.Store'}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => link.to.includes('#') && closeSheet()}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive && !link.to.includes('#') ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {link.text}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">{cart.length}</Badge>
              )}
              <span className="sr-only">Keranjang Belanja</span>
            </Link>
          </Button>
          {renderAuthButtons()}
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
           <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">{cart.length}</Badge>
              )}
              <span className="sr-only">Keranjang Belanja</span>
            </Link>
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center border-b pb-4">
                  <Link to="/" onClick={closeSheet} className="flex items-center gap-2">
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto" />}
                    <span className="font-bold text-lg">{settings.appName || 'Cellkom.Store'}</span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.to}>
                      <NavLink
                        to={link.to}
                        onClick={() => link.to.includes('#') && closeSheet()}
                        className={({ isActive }) =>
                          `text-lg font-medium transition-colors hover:text-primary ${
                            isActive && !link.to.includes('#') ? "text-primary" : "text-foreground"
                          }`
                        }
                      >
                        {link.text}
                      </NavLink>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-4 space-y-2">
                  <div className="space-y-2">
                    {renderAuthButtons(true)}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">Ganti Tema</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;