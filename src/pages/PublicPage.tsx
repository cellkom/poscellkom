import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Laptop, Printer, Wrench, Sparkles, ShieldCheck, ArrowRight, ShoppingCart } from "lucide-react";
import logoSrc from '/logo.png';

const PublicPage = () => {
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
          <Link to="/public" className="flex items-center gap-2">
            <img src={logoSrc} alt="CELLKOM Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link to="/login">Login Staff</Link>
            </Button>
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

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-3 gap-12 text-center">
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

        {/* Footer */}
        <footer className="bg-background border-t">
          <div className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground">
            <img src={logoSrc} alt="CELLKOM Logo" className="h-12 w-auto mx-auto mb-4" />
            <p>&copy; {new Date().getFullYear()} CELLKOM. All rights reserved.</p>
            <p className="text-sm mt-2">Jorong Kampung Baru, Muaro Paiti, Kec. Kapur IX | Telp: 082285959441</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PublicPage;