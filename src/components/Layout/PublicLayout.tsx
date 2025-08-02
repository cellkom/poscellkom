import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserCircle, Instagram, Menu, ShoppingCart, Wrench, Info, Phone, Newspaper, LayoutDashboard, Code } from "lucide-react";
import logoSrc from '/logo.png';
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CartSidebar from "@/components/CartSidebar";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const { session, profile, signOut } = useAuth();
  const { cartCount } = useCart();

  const navLinks = [
    { name: "Layanan Servis", href: "/#services", icon: Wrench },
    { name: "Produk", href: "/products", icon: ShoppingCart },
    { name: "Jasa Aplikasi", href: "/#it-services", icon: Code },
    { name: "Berita", href: "/news", icon: Newspaper },
    { name: "Tentang Kami", href: "/#about", icon: Info },
    { name: "Kontak", href: "/#contact", icon: Phone },
  ];

  const profileLink = profile?.role === 'Member' ? '/member-profile' : '/profile';

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg md:text-xl font-bold font-poppins">
                <span className="text-primary">Cellkom</span><span className="font-semibold text-muted-foreground">.Store</span>
              </h1>
              <p className="hidden md:block text-xs text-muted-foreground -mt-1">Pusat Service HP dan Komputer</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {navLinks.map(link => (
              link.href.startsWith('/#') ? (
                <a key={link.name} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} to={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Keranjang Belanja</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                <CartSidebar />
              </SheetContent>
            </Sheet>

            {session && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                      <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={profileLink} className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      <span>Profil Saya</span>
                    </Link>
                  </DropdownMenuItem>
                  {(profile.role === 'Admin' || profile.role === 'Kasir') && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/member-login" aria-label="Halaman Login">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">Buka halaman login</span>
                </Link>
              </Button>
            )}

            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Buka menu navigasi</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="grid gap-6 text-lg font-medium mt-8">
                    {navLinks.map(link => (
                      link.href.startsWith('/#') ? (
                        <a key={link.name} href={link.href} className="flex items-center gap-4 text-muted-foreground hover:text-foreground">
                          <link.icon className="h-6 w-6" />
                          {link.name}
                        </a>
                      ) : (
                        <Link key={link.name} to={link.href} className="flex items-center gap-4 text-muted-foreground hover:text-foreground">
                          <link.icon className="h-6 w-6" />
                          {link.name}
                        </Link>
                      )
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer id="contact" className="bg-background text-muted-foreground pt-16 pb-8 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Segera Kunjungi Store Kami
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Kami siap membantu Anda dengan layanan terbaik.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-primary rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <img src={logoSrc} alt="Cellkom.Store Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold font-poppins">
                  <span className="text-foreground">Cellkom</span><span className="font-semibold text-muted-foreground">.Store</span>
                </span>
              </Link>
              <p className="text-sm">
                Pusat Servis HP dan Komputer Terpercaya. Cepat, Profesional, dan Bergaransi.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Navigasi</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/#services" className="hover:text-primary transition-colors">Layanan</a></li>
                <li><Link to="/products" className="hover:text-primary transition-colors">Toko</Link></li>
                <li><a href="/#about" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                <li><a href="/#news" className="hover:text-primary transition-colors">Berita</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Kontak</h3>
              <address className="space-y-2 text-sm not-italic">
                <p>Jorong Kampung Baru, Muaro Paiti, Kec. Kapur IX</p>
                <p>Email: <a href="mailto:ckcellkom@gmail.com" className="hover:text-primary transition-colors">ckcellkom@gmail.com</a></p>
                <p>Telepon: <a href="tel:082285959441" className="hover:text-primary transition-colors">082285959441</a></p>
              </address>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Ikuti Kami</h3>
              <p className="text-sm">Dapatkan info terbaru dan promo menarik.</p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12">
          <div className="container mx-auto px-4 md:px-6 py-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cellkomtech. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;