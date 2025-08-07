import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserCircle, Instagram, Menu, ShoppingCart, Wrench, Info, Phone, Newspaper, LayoutDashboard, Code, Image as ImageIcon, ClipboardList, Facebook, Youtube, Music, Search, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Input } from "@/components/ui/input";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { session, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const { articles, loading: newsLoading } = useNews();
  const [latestArticles, setLatestArticles] = useState<NewsArticle[]>([]);
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

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

  const profileLink = profile?.role === 'Member' ? '/member-profile' : '/profile';
  const logoLink = (profile?.role === 'Admin' || profile?.role === 'Kasir') ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground print:hidden">
        {/* Top Bar */}
        <div className="border-b border-white/20">
          <div className="container mx-auto flex h-8 items-center justify-between px-4 md:px-6 text-xs">
            <div className="flex items-center gap-4">
              {settings.socialFacebook && <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80"><Facebook className="h-4 w-4" /></a>}
              {settings.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80"><Instagram className="h-4 w-4" /></a>}
              {settings.socialYoutube && <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80"><Youtube className="h-4 w-4" /></a>}
              {settings.socialTiktok && <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-80"><Music className="h-4 w-4" /></a>}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/tracking" className="flex items-center gap-1 hover:underline"><HelpCircle className="h-4 w-4" /> Bantuan</Link>
              <ThemeToggle />
              {session && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-xs text-white hover:text-white hover:bg-transparent p-0 h-auto">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                        <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{profile.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to={profileLink} className="cursor-pointer">Profil Saya</Link></DropdownMenuItem>
                    {profile?.role === 'Member' && <DropdownMenuItem asChild><Link to="/my-orders" className="cursor-pointer">Daftar Pesanan</Link></DropdownMenuItem>}
                    {(profile.role === 'Admin' || profile.role === 'Kasir') && <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer">Dashboard</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/member-login" className="font-semibold hover:underline">Daftar</Link>
                  <div className="border-l h-3 border-white/50"></div>
                  <Link to="/member-login" className="font-semibold hover:underline">Log In</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto flex h-20 items-center justify-between gap-4 md:gap-8 px-4 md:px-6">
          <Link to={logoLink} className="flex items-center gap-3 text-white flex-shrink-0">
            <img src={settings.logoUrl || '/logo.png'} alt="App Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold font-poppins hidden sm:inline">
              {settings.appName || 'Cellkom.Store'}
            </span>
          </Link>

          <div className="flex-grow max-w-3xl hidden md:block">
            <form onSubmit={handleSearch} className="relative bg-white rounded-sm p-0.5">
              <Input
                type="text"
                placeholder="Cari casing, baterai, LCD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 border-none focus-visible:ring-0 text-black pr-16"
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-9 w-14 bg-primary hover:bg-red-700 rounded-sm">
                <Search className="h-5 w-5 text-white" />
              </Button>
            </form>
            <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
              <Link to="/products?search=lcd" className="hover:text-white">LCD</Link>
              <Link to="/products?search=baterai" className="hover:text-white">Baterai</Link>
              <Link to="/products?search=charger" className="hover:text-white">Charger</Link>
              <Link to="/products?search=servis" className="hover:text-white">Servis</Link>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative text-white hover:bg-primary/80 hover:text-white p-2">
                  <ShoppingCart className="h-7 w-7" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute top-0 right-0 h-5 w-5 justify-center rounded-full p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                <CartSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-primary p-2 print:hidden">
        <form onSubmit={handleSearch} className="relative bg-white rounded-sm">
          <Input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 border-none focus-visible:ring-0 text-black pr-14"
          />
          <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-12 bg-primary hover:bg-red-700 rounded-l-none rounded-r-sm">
            <Search className="h-5 w-5 text-white" />
          </Button>
        </form>
      </div>

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