import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Wrench, Smartphone, Laptop, Cpu, Shield, Clock, Users, Newspaper, Phone, Mail, MapPin, Info, ClipboardList, FileText, Settings, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import logoSrc from '/logo.png';

interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  slug: string;
  published_at: string;
}

const PublicPage = () => {
  const { data: news, isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const services = [
    { icon: Smartphone, title: 'Servis Smartphone', description: 'Perbaikan semua merek HP, dari layar retak hingga masalah baterai.' },
    { icon: Laptop, title: 'Servis Laptop & PC', description: 'Solusi untuk masalah hardware dan software komputer Anda.' },
    { icon: Cpu, title: 'Ganti Sparepart', description: 'Suku cadang original dan berkualitas untuk semua jenis perangkat.' },
  ];

  const whyUs = [
    { icon: Shield, title: 'Bergaransi', description: 'Setiap perbaikan dan produk yang kami jual memiliki garansi resmi.' },
    { icon: Clock, title: 'Pengerjaan Cepat', description: 'Kami menghargai waktu Anda dengan proses yang efisien.' },
    { icon: Users, title: 'Teknisi Ahli', description: 'Tim kami terdiri dari para profesional berpengalaman di bidangnya.' },
  ];

  const testimonials = [
    { name: 'Budi Santoso', role: 'Pelanggan', avatar: '/avatars/budi.jpg', text: 'Servisnya cepat dan hasilnya memuaskan. Laptop saya kembali normal seperti baru. Recommended!' },
    { name: 'Citra Lestari', role: 'Pelanggan', avatar: '/avatars/citra.jpg', text: 'Pilihan aksesorisnya lengkap dan harganya terjangkau. Pelayanannya juga ramah banget.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-950 shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center justify-center">
          <img src={logoSrc} alt="Cellkom.Store Logo" className="h-10 w-auto" />
          <span className="sr-only">Cellkom.Store</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#services">
            Layanan
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#products">
            Produk
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#news">
            Berita
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#contact">
            Kontak
          </a>
          <Link to="/member-login">
            <Button variant="outline" size="sm">Login Member</Button>
          </Link>
          <Link to="/login">
            <Button size="sm">Login Staf</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-primary to-orange-400">
              Solusi Total untuk Gadget & Komputer Anda
            </h1>
            <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl dark:text-gray-400 mb-8">
              Dari perbaikan cepat hingga penjualan produk berkualitas, Cellkom.Store adalah partner terpercaya Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Belanja Sekarang
              </Link>
              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <Wrench className="mr-2 h-4 w-4" /> Layanan Servis Kami
              </a>
              <a
                href="#service-process"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <Info className="mr-2 h-4 w-4" /> Informasi Proses Service
              </a>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="products" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Produk Unggulan</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Temukan Kebutuhan Anda</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Kami menyediakan berbagai macam aksesoris, sparepart, dan produk digital lainnya.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {/* Placeholder for products */}
              <Card><CardHeader><CardTitle>Aksesoris</CardTitle></CardHeader><CardContent><p>Charger, kabel, casing, dan lainnya.</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Sparepart</CardTitle></CardHeader><CardContent><p>LCD, baterai, dan komponen lainnya.</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Produk Lain</CardTitle></CardHeader><CardContent><p>Perdana, voucher, dan produk digital.</p></CardContent></Card>
            </div>
            <div className="flex justify-center">
              <Link to="/products">
                <Button>Lihat Semua Produk</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Layanan Kami</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Profesional dan Terpercaya</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Percayakan perangkat Anda kepada kami untuk penanganan terbaik.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {services.map((service, index) => (
                <div key={index} className="grid gap-1 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold">{service.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Process Section */}
        <section id="service-process" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Proses Servis Kami</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Transparan dan Terstruktur</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Kami memastikan Anda selalu tahu status perbaikan perangkat Anda di setiap langkahnya.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-16 mt-12">
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">1. Pengecekan Awal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bawa perangkat Anda, tim kami akan melakukan diagnosa awal dan memberikan penjelasan masalah.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">2. Estimasi & Persetujuan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Anda akan menerima estimasi biaya dan waktu. Perbaikan hanya dilanjutkan setelah persetujuan Anda.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">3. Proses Perbaikan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Teknisi ahli kami akan memperbaiki perangkat Anda menggunakan suku cadang berkualitas.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">4. Pengambilan & Garansi</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kami akan mengabari Anda jika sudah selesai. Semua servis kami dilengkapi dengan garansi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Mengapa Kami?</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Keunggulan Cellkom.Store</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Kami berkomitmen untuk memberikan yang terbaik bagi pelanggan kami.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {whyUs.map((item, index) => (
                <div key={index} className="grid gap-1 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Apa Kata Pelanggan Kami</h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Kepuasan Anda adalah prioritas utama kami.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2 text-left">
                        <p className="text-sm leading-loose text-gray-500 dark:text-gray-400">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  <Newspaper className="inline-block w-4 h-4 mr-1" />
                  Berita & Promo
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ikuti Kabar Terbaru</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Jangan lewatkan informasi dan penawaran menarik dari kami.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {isLoadingNews ? (
                <p>Memuat berita...</p>
              ) : (
                news?.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      alt={item.title}
                      className="aspect-video w-full object-cover"
                      height="250"
                      src={item.image_url || '/placeholder.svg'}
                      width="400"
                    />
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">{format(new Date(item.published_at), 'dd MMMM yyyy', { locale: id })}</Badge>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{item.content}</p>
                      <Link to={`/news/${item.slug}`} className="text-sm font-medium text-primary hover:underline mt-4 inline-block">
                        Baca Selengkapnya
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Cellkom.Store</h4>
            <p className="text-gray-600 dark:text-gray-400">Pusat servis dan penjualan aksesoris HP & Komputer terpercaya di kota Anda.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Hubungi Kami</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> email@cellkom.store</li>
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> (0274) 123456</li>
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Jl. Malioboro No. 1, Yogyakarta</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tautan</h4>
            <ul className="space-y-1">
              <li><a href="#services" className="hover:underline">Layanan</a></li>
              <li><a href="#products" className="hover:underline">Produk</a></li>
              <li><a href="#" className="hover:underline">Tentang Kami</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Cellkom.Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;