import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserCircle, Instagram, Menu, ShoppingCart, Wrench, Info, Phone, Newspaper, LayoutDashboard, Code, Image as ImageIcon, ClipboardList, Facebook, Youtube, Music } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CartSidebar from "@/components/CartSidebar";
import { useNews, NewsArticle } from "@/hooks/use-news";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSearchInput } from "@/components/GlobalSearchInput";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { session, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const { articles, loading: newsLoading } = useNews();
  const [latestArticles, setLatestArticles] = useState<NewsArticle[]>([]);
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      const hasVisited = sessionStorage.getItem('hasVisited');
      if (!hasVisited) {
        try {
          await supabase.functions.invoke('track-visit');
          sessionStorage.setItem('hasVisited', 'true');
        } catch (error) {
          console.error("Failed to track visit:", error);
        }
      }
    };
    trackVisit();
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      setLatestArticles(articles.slice(0, 3));
    }
  }, [articles]);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const navLinks = [
    { name: "Layanan Servis", href: "/#services", icon: Wrench },
    { name: "Produk", href: "/products", icon: ShoppingCart },
    { name: "Jasa Aplikasi", href: "/#it-services", icon: Code },
    { name: "Berita", href: "/news", icon: Newspaper },
    { name: "Tentang Kami", href: "/#about", icon: Info },
    { name: "Kontak", href: "/#contact", icon: Phone },
  ];

  const profileLink = profile?.role === 'Member' ? '/member-profile' : '/profile';
  const logoLink = (profile?.role === 'Admin' || profile?.role === 'Kasir') ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        {/* Main Header Bar */}
        <div className="container mx-auto flex h-20 items-center gap-2 px-4 md:px-6">
          <Link to={logoLink} className="flex items-center gap-2 flex-shrink-0">
            <img src={settings.logoUrl || '/logo.png'} alt="App Logo" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold font-poppins">
                <span className="text-primary">{settings.appName ? settings.appName.split('.')[0] : 'Cellkom'}</span>
                <span className="font-semibold text-muted-foreground">{settings.appName && settings.appName.includes('.') ? `.${settings.appName.split('.')[1]}`: '.Store'}</span>
              </h1>
            </div>
          </Link>

          <div className="flex-grow max-w-2xl mx-auto">
            <GlobalSearchInput />
          </div>

          <div className="flex items-center gap-1 ml-auto">
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
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
                  {profile?.role === 'Member' && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-orders" className="flex items-center gap-2 cursor-pointer">
                        <ClipboardList className="h-4 w-4" />
                        <span>Daftar Pesanan</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
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
              <Button asChild className="hidden md:flex">
                <Link to="/member-login">Masuk / Daftar</Link>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Buka menu navigasi</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-4 text-base font-medium mt-4 p-4">
                  {navLinks.map(link => (
                    <Link key={link.name} to={link.href} className="flex items-center gap-4 text-muted-foreground hover:text-foreground">
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  ))}
                </nav>
                {!session && (
                  <div className="p-4 mt-4 border-t">
                    <Button asChild className="w-full">
                      <Link to="/member-login">Masuk / Daftar</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Navigation Bar */}
        <nav className="hidden md:flex h-10 items-center justify-center border-t bg-primary">
          <div className="container mx-auto flex items-center justify-center gap-8 text-sm font-medium px-4 md:px-6">
            {navLinks.map(link => (
              <Link key={link.name} to={link.href} className="text-primary-foreground/90 transition-colors hover:text-primary-foreground">
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-grow">{children}</main>

      <footer id="contact" className="bg-background text-muted-foreground pt-16 pb-8 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Berita & Info Terbaru
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Ikuti perkembangan dan tips terbaru dari kami.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                latestArticles.map(article => (
                  <Link key={article.id} to={`/news/${article.slug}`} className="block group">
                    <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                      <div className="aspect-video bg-muted overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{format(new Date(article.published_at!), 'd MMMM yyyy', { locale: id })}</p>
                        <h4 className="font-semibold text-foreground mt-1 line-clamp-2">{article.title}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>

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
                <img src={settings.logoUrl || '/logo.png'} alt="App Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold font-poppins">
                  <span className="text-foreground">{settings.appName || 'Cellkom.Store'}</span>
                </span>
              </Link>
              <p className="text-sm">
                {settings.appDescription || 'Pusat Servis HP dan Komputer Terpercaya. Cepat, Profesional, dan Bergaransi.'}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Author</h3>
              <div className="flex items-center gap-4">
                <img src={settings.authorImageUrl || "/author.jpg"} alt="Author" className="w-20 h-20 object-cover rounded-lg shadow-md flex-shrink-0" />
                <p className="text-sm">
                  {settings.authorDescription || "Aplikasi ini dikembangkan oleh putra daerah yang berdedikasi untuk memberikan solusi teknologi terbaik bagi komunitas."}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Kontak</h3>
              <address className="space-y-2 text-sm not-italic">
                <p>{settings.contactAddress || 'Jorong Kampung Baru, Muaro Paiti, Kec. Kapur IX'}</p>
                <p>Email: <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary transition-colors">{settings.contactEmail || 'ckcellkom@gmail.com'}</a></p>
                <p>Telepon: <a href={`tel:${settings.contactPhone}`} className="hover:text-primary transition-colors">{settings.contactPhone || '082285959441'}</a></p>
              </address>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Ikuti Kami</h3>
              <p className="text-sm">Dapatkan info terbaru dan promo menarik.</p>
              <div className="flex space-x-4">
                {settings.socialInstagram && (
                  <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {settings.socialFacebook && (
                  <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {settings.socialYoutube && (
                  <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-primary transition-colors">
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
                {settings.socialTiktok && (
                  <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-primary transition-colors">
                    <Music className="h-6 w-6" /> {/* Using Music icon for TikTok */}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12">
          <div className="container mx-auto px-4 md:px-6 py-4 text-center text-sm text-muted-foreground">
            {settings.footerCopyright || `© ${new Date().getFullYear()} Cellkomtech. All Rights Reserved.`}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;