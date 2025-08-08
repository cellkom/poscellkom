import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductReview } from "@/types";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, MessageSquare, UserCircle, Send } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProductDetailPage = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { session, profile } = useAuth();
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProductAndReviews = async () => {
    if (!productId) return;
    setLoading(true);
    
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !productData) {
      toast.error("Gagal memuat detail produk.");
      console.error(productError);
      setLoading(false);
      return;
    }
    
    const formattedProduct: Product = {
      id: productData.id,
      createdAt: productData.created_at,
      name: productData.name,
      category: productData.category,
      description: productData.description,
      stock: productData.stock,
      buyPrice: productData.buy_price,
      retailPrice: productData.retail_price,
      resellerPrice: productData.reseller_price,
      barcode: productData.barcode,
      supplierId: productData.supplier_id,
      entryDate: productData.entry_date,
      imageUrl: productData.image_url,
    };
    setProduct(formattedProduct);

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("product_reviews")
      .select(`
        *,
        user_profiles!user_id (
          full_name,
          avatar_url
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      toast.error("Gagal memuat ulasan produk.");
      console.error(reviewsError);
    } else {
      setReviews(reviewsData as ProductReview[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !profile || !product) {
      toast.error("Anda harus login untuk memberikan ulasan.");
      return;
    }
    if (rating === 0) {
      toast.error("Harap berikan rating bintang.");
      return;
    }
    if (!newReview.trim()) {
      toast.error("Ulasan tidak boleh kosong.");
      return;
    }

    setIsSubmittingReview(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      user_id: session.user.id,
      rating,
      comment: newReview,
    });

    if (error) {
      toast.error("Gagal mengirim ulasan. Error: " + error.message);
    } else {
      toast.success("Ulasan berhasil dikirim!");
      setNewReview("");
      setRating(0);
      fetchProductAndReviews(); // Refresh reviews
    }
    setIsSubmittingReview(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Produk tidak ditemukan.</h2>
          <Button asChild className="mt-4">
            <Link to="/products">Kembali ke Daftar Produk</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-muted rounded-lg flex items-center justify-center aspect-square overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ShoppingCart className="h-32 w-32 text-muted-foreground/20" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({reviews.length} ulasan)</span>
            </div>
            <p className="text-4xl font-bold text-primary my-4">{formatCurrency(product.retailPrice)}</p>
            <p className="text-muted-foreground flex-grow">{product.description || "Tidak ada deskripsi untuk produk ini."}</p>
            <div className="mt-6">
              <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Stok: {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
              </p>
              <Button size="lg" className="w-full mt-2" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Ulasan Produk</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Review Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Tulis Ulasan Anda</CardTitle>
                </CardHeader>
                <CardContent>
                  {session ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="font-semibold">Rating Anda</label>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-7 w-7 cursor-pointer ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                              onClick={() => setRating(i + 1)}
                            />
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder={`Bagikan pendapat Anda tentang ${product.name}...`}
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        rows={4}
                      />
                      <Button type="submit" disabled={isSubmittingReview}>
                        {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center text-muted-foreground p-4 border rounded-lg">
                      <p>Anda harus login untuk memberikan ulasan.</p>
                      <Button asChild variant="link" className="mt-2">
                        <Link to="/member-login">Masuk / Daftar Sekarang</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.user_profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        <UserCircle />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.user_profiles?.full_name || 'Pengguna Anonim'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), 'd MMMM yyyy', { locale: id })}</p>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                  <MessageSquare className="h-10 w-10 mx-auto mb-4" />
                  <p>Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProductDetailPage;