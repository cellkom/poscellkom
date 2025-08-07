import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/hooks/use-news';
import PublicLayout from '@/components/Layout/PublicLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:user_profiles (
            full_name
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        setError('Gagal memuat artikel. Mungkin artikel tidak ditemukan atau terjadi kesalahan jaringan.');
      } else {
        setArticle(data as NewsArticle);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-80 w-full rounded-lg mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Artikel Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">{error || 'Artikel yang Anda cari tidak ada atau telah dihapus.'}</p>
          <Link to="/news" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Berita
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article>
          <header className="mb-8">
            <Link to="/news" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke semua berita
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Diterbitkan pada {format(new Date(article.published_at!), 'd MMMM yyyy', { locale: id })}</span>
              </div>
              {article.author && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Oleh {article.author.full_name}</span>
                </div>
              )}
            </div>
          </header>

          {article.image_url && (
            <div className="mb-8">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />
        </article>
      </div>
    </PublicLayout>
  );
};

export default NewsDetailPage;