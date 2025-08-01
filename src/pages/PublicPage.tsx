import PublicLayout from "@/components/Layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Laptop, Printer, Wrench, Sparkles, ShieldCheck, ArrowRight, ShoppingCart, Code, Image as ImageIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useStock } from "@/hooks/use-stock";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PublicPage = () => {
  const { products, loading } = useStock();
  const { session, profile } = useAuth();
  const location = useLocation();

  const isMember = session && profile?.role === 'Member';
  const displayedProducts = isMember ? products : products.slice(0, 4);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

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
    <PublicLayout>
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
                <Link to="/products">Lihat Produk Unggulan <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {isMember ? "Semua Produk & Sparepart" : "Produk & Sparepart Unggulan"}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {isMember ? "Jelajahi semua koleksi kami yang tersedia." : "Temukan komponen dan aksesoris berkualitas untuk perangkat Anda."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                Array.from({ length: isMember ? 8 : 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3 mt-2" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                displayedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group transition-shadow hover:shadow-lg">
                    <CardHeader className="p-0">
                      <div className="bg-muted aspect-square flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="font-bold mt-2 text-primary">{formatCurrency(product.retailPrice)}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {!isMember && (
              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link to="/products">Lihat Semua Produk <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            )}
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
      </main>
    </PublicLayout>
  );
};

export default PublicPage;