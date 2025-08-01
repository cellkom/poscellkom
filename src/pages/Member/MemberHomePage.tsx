import MemberLayout from "@/components/Layout/MemberLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Laptop, Printer, ShoppingCart, ArrowRight } from "lucide-react";
import { useStock } from "@/hooks/use-stock";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const MemberHomePage = () => {
    const { products, loading: productsLoading } = useStock();

    const services = [
        {
          icon: Smartphone,
          title: "Servis Smartphone",
          description: "Ganti LCD, baterai, perbaikan mati total, dan lainnya.",
          link: "/member/order/service-smartphone"
        },
        {
          icon: Laptop,
          title: "Servis Komputer & Laptop",
          description: "Instal ulang, upgrade, perbaikan motherboard, dan lainnya.",
          link: "/member/order/service-laptop"
        },
        {
          icon: Printer,
          title: "Servis Printer",
          description: "Perbaikan hasil cetak, infus, reset, dan lainnya.",
          link: "/member/order/service-printer"
        },
    ];

    return (
        <MemberLayout>
            <div className="space-y-12">
                {/* Services Section */}
                <section id="services">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pesan Layanan Servis</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Pilih jenis layanan yang Anda butuhkan.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <Card key={service.title} className="text-center flex flex-col">
                                <CardHeader>
                                    <service.icon className="h-12 w-12 mx-auto text-primary" />
                                    <CardTitle className="mt-4">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">{service.description}</p>
                                </CardContent>
                                <div className="p-6 pt-0">
                                    <Button asChild className="w-full">
                                        <Link to={service.link}>Pesan Layanan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Products Section */}
                <section id="products">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Belanja Sparepart & Aksesoris</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Produk berkualitas tersedia untuk Anda.</p>
                    </div>
                    {productsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 8).map((product) => ( // Show first 8 products
                                <Card key={product.id} className="overflow-hidden group flex flex-col">
                                    <div className="bg-muted aspect-square flex items-center justify-center">
                                        <ShoppingCart className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <CardContent className="p-4 flex-grow flex flex-col">
                                        <h3 className="font-semibold truncate text-base flex-grow" title={product.name}>{product.name}</h3>
                                        <p className="text-lg font-bold text-primary pt-2">{formatCurrency(product.retailPrice)}</p>
                                    </CardContent>
                                    <div className="p-4 pt-0">
                                        <Button asChild className="w-full" variant="outline">
                                            <Link to={`/member/product/${product.id}`}>Lihat Detail</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </MemberLayout>
    );
};

export default MemberHomePage;