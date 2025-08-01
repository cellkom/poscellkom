import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Smartphone, Laptop, Printer, Wrench, Sparkles, ShieldCheck, ArrowRight, ShoppingCart, UserCircle, Instagram, Menu, Code } from "lucide-react";
import logoSrc from '/logo.png';
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

const PublicPage = () => {
  const isMobile = useIsMobile();

  const navLinks = [
    { name: "Layanan", href: "#services" },
    { name: "Toko", href: "#products" },
    { name: "Tentang Kami", href: "#about" },
    { name: "Layanan IT", href: "#it-services" },
    { name: "Berita", href: "#news" },
    { name: "Kontak", href: "#contact" },
  ];

  const services = [
    {
      icon: Smartphone,
      title: "Servis Smartphone",
      description: "Ganti LCD, baterai, perbaikan mati total, masalah software, dan lainnya untuk semua merk HP.",
    },
    {
      icon: Laptop,
      title: "Servis Komputer & Laptop",
      description: "Instal ulang OS, upgrade RAM/SSD, perbaikan motherboard, pembersihan virus, dan perawatan hardware.",
    },
    {
      icon: Printer,
      title: "Servis Printer",
      description: "Perbaikan hasil cetak, printer tidak menarik kertas, infus, reset, dan penggantian sparepart.",
    },
  ];

  const products = [
    { name: "LCD iPhone 11 Original", category: "Sparepart HP", price: "Rp 850.000" },
    { name: "Baterai Samsung A51", category: "Sparepart HP", price: "Rp 250.000" },
    { name: "SSD 256GB V-Gen", category: "Sparepart Komputer", price: "Rp 350.000" },
    { name: "Tinta Printer Epson 003", category: "Aksesoris", price: "Rp 75.000" },
  ];

  const features = [
    {
      icon: Wrench,
      title: "Teknisi Ahli",
      description: "Tim kami terdiri dari teknisi profesional dan berpengalaman di bidangnya.",
    },
    {
      icon: Sparkles,
      title: "Sparepart Berkualitas",
      description: "Kami hanya menggunakan sparepart original atau dengan kualitas terbaik.",
    },
    {
      icon: ShieldCheck,
      title: "Garansi Servis",
      description: "Setiap perbaikan yang kami lakukan disertai dengan garansi untuk kepuasan Anda.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold font-poppins">
                <span className="text-primary">Cellkom</span><span className="font-semibold text-muted-foreground">.Store</span>
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Pusat Service HP dan Komputer</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">Buka menu login</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Menu Login</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login">Login Staff</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/login">Login Website</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                      <a key={link.name} href={link.href} className="text-muted-foreground hover:text-foreground">
                        {link.name}
                      </a>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-primary to-orange-400">
              Solusi Total untuk Gadget & Komputer Anda
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
              Dari perbaikan cepat hingga penjualan sparepart berkualitas, kami siap melayani semua kebutuhan teknologi Anda dengan profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#services">Layanan Servis Kami <Wrench className="ml-2 h-5 w-5" /></a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#products">Lihat Produk Unggulan <ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Layanan Servis Profesional</h2>
              <p className="mt-4 text-lg text-muted-foreground">Kami menangani berbagai jenis kerusakan dengan teknisi berpengalaman.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.title} className="text-center hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
                  <CardHeader>
                    <service.icon className="h-12 w-12 mx-auto text-primary" />
                    <CardTitle className="mt-4">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="products" className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Produk & Sparepart Unggulan</h2>
              <p className="mt-4 text-lg text-muted-foreground">Temukan komponen dan aksesoris berkualitas untuk perangkat Anda.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card key={product.name} className="overflow-hidden group transition-shadow hover:shadow-lg">
                  <div className="bg-muted h-48 flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="font-bold mt-2 text-primary">{product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tentang Kami</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Cellkom.Store adalah pusat layanan terpadu untuk perbaikan dan penjualan sparepart smartphone, komputer, dan laptop. Berdiri sejak tahun 2024, kami berkomitmen untuk memberikan solusi teknologi yang cepat, andal, dan terjangkau bagi masyarakat.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 text-center mt-16">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center">
                  <feature.icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IT Services Section */}
        <section id="it-services" className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
                <Code className="inline-block h-4 w-4 mr-2" />
                Jasa Pembuatan Aplikasi
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Butuh Aplikasi Untuk Bisnis Anda?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Selain layanan servis, tim IT kami juga siap membantu mengembangkan solusi digital untuk bisnis Anda. Dapatkan aplikasi custom seperti sistem kasir, manajemen inventaris, atau website profil yang modern dan fungsional.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <a href="#contact">
                    Konsultasi Gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Berita & Update</h2>
              <p className="mt-4 text-lg text-muted-foreground">Informasi dan berita terbaru dari kami.</p>
              <p className="mt-4 text-muted-foreground">Segera hadir...</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-background text-muted-foreground pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Segera Kunjungi Store Kami</h2>
            <p className="mt-4 text-lg text-muted-foreground">Kami siap membantu Anda dengan layanan terbaik.</p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-primary rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
            {/* Column 1: Logo & About */}
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

            {/* Column 2: Navigasi */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Navigasi</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-primary transition-colors">Layanan</a></li>
                <li><a href="#products" className="hover:text-primary transition-colors">Toko</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                <li><a href="#news" className="hover:text-primary transition-colors">Berita</a></li>
              </ul>
            </div>

            {/* Column 3: Kontak */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Kontak</h3>
              <address className="space-y-2 text-sm not-italic">
                <p>Jorong Kampung Baru, Muaro Paiti, Kec. Kapur IX</p>
                <p>Email: <a href="mailto:ckcellkom@gmail.com" className="hover:text-primary transition-colors">ckcellkom@gmail.com</a></p>
                <p>Telepon: <a href="tel:082285959441" className="hover:text-primary transition-colors">082285959441</a></p>
              </address>
            </div>

            {/* Column 4: Ikuti Kami */}
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

export default PublicPage;