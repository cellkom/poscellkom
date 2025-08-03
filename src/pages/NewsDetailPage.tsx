import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useNews, NewsArticle } from "@/hooks/use-news";
import { Loader2, Calendar, User, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getArticleBySlug, loading } = useNews();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchArticle = async () => {
        const data = await getArticleBySlug(slug);
        setArticle(data);
      };
      fetchArticle();
    }
  }, [slug, getArticleBySlug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Artikel tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">Artikel yang Anda cari mungkin telah dihapus atau URL-nya salah.</p>
          <Button asChild className="mt-6">
            <Link to="/news">Kembali ke Daftar Berita</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Berita</Link>
          </Button>
        </div>
        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{article.author_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Oleh {article.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(article.published_at!), 'd MMMM yyyy', { locale: id })}</span>
              </div>
            </div>
          </header>
          {article.image_url && (
            <img src={article.image_url} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />
          )}
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, '<br />') || '' }}
          />
        </article>
      </div>
    </PublicLayout>
  );
};

export default NewsDetailPage;