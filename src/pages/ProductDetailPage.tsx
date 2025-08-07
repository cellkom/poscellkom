import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '@/components/Layout/PublicLayout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/use-stock';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { ShoppingCart, Image as ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { showError, showSuccess } from '@/utils/toast';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const ProductDetailPage = () => {
  const { id: productId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!productId) return;
      setLoading(true);

      const productPromise = supabase.from('products').select('*').eq('id', productId).single();
      const reviewsPromise = supabase
        .from('product_reviews')
        .select(`*, user_profiles (full_name, avatar_url)`)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      const [{ data: productData, error: productError }, { data: reviewsData, error: reviewsError }] = await Promise.all([productPromise, reviewsPromise]);

      if (productError) {
        showError('Gagal memuat produk.');
        console.error(productError);
      } else {
        const p = productData;
        setProduct({
          id: p.id, createdAt: p.created_at, name: p.name, category: p.category, stock: p.stock,
          buyPrice: p.buy_price, retailPrice: p.retail_price, resellerPrice: p.reseller_price,
          barcode: p.barcode, supplierId: p.supplier_id, entryDate: p.entry_date, imageUrl: p.image_url,
        });
      }

      if (reviewsError) {
        showError('Gagal memuat ulasan.');
        console.error(reviewsError);
      } else {
        setReviews(reviewsData as any);
      }

      setLoading(false);
    };

    fetchProductAndReviews();
  }, [productId]);

  const { averageRating, totalReviews } = useMemo(() => {
    if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 };
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      averageRating: total / reviews.length,
      totalReviews: reviews.length,
    };
  }, [reviews]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myRating === 0) {
      showError('Harap berikan rating bintang.');
      return;
    }
    if (!profile) {
      showError('Anda harus login untuk memberikan ulasan.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: profile.id,
      rating: myRating,
      comment: myComment,
    });
    setIsSubmitting(false);
    if (error) {
      if (error.code === '23505') { // unique constraint violation
        showError('Anda sudah pernah memberikan ulasan untuk produk ini.');
      } else {
        showError(`Gagal mengirim ulasan: ${error.message}`);
      }
    } else {
      showSuccess('Ulasan Anda berhasil dikirim!');
      // Manually add the new review to the top of the list for immediate feedback
      const newReview: Review = {
        id: crypto.randomUUID(),
        rating: myRating,
        comment: myComment,
        created_at: new Date().toISOString(),
        user_profiles: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url || null,
        },
      };
      setReviews([newReview, ...reviews]);
      setMyRating(0);
      setMyComment('');
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-10 w-1/3" />
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
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Produk tidak ditemukan</h2>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-muted rounded-lg flex items-center justify-center aspect-square overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-32 w-32 text-muted-foreground/20" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={averageRating} readOnly />
              <span className="text-sm text-muted-foreground">({totalReviews} ulasan)</span>
            </div>
            <p className="text-4xl font-bold text-primary mt-4">{formatCurrency(product.retailPrice)}</p>
            <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
            </p>
            <div className="mt-6">
              <Button size="lg" className="w-full" onClick={() => addToCart(product)} disabled={product.stock <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Ulasan Pelanggan ({totalReviews})</h2>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.user_profiles?.avatar_url || ''} />
                      <AvatarFallback>{review.user_profiles?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{review.user_profiles?.full_name || 'Anonim'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), 'd MMM yyyy', { locale: id })}</p>
                      </div>
                      <StarRating rating={review.rating} size={16} readOnly className="mt-1" />
                      <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Belum ada ulasan untuk produk ini.</p>
              )}
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tulis Ulasan Anda</h3>
                {profile ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Rating Anda</label>
                      <StarRating rating={myRating} onRate={setMyRating} size={24} />
                    </div>
                    <div>
                      <label htmlFor="comment" className="text-sm font-medium">Komentar</label>
                      <Textarea id="comment" value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="Bagikan pengalaman Anda..." />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kirim Ulasan
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">Anda harus <a href="/member-login" className="text-primary underline">login</a> untuk memberikan ulasan.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProductDetailPage;