import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews, NewsArticle } from "@/hooks/use-news";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-80 w-full mb-8" />
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-2/3 mb-4" />
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground mt-2">Berita tidak ditemukan.</p>
          <Button asChild className="mt-6">
            <Link to="/news">Kembali ke Daftar Berita</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <article>
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Berita
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time dateTime={article.published_at!}>
                {article.published_at ? format(new Date(article.published_at), "d MMMM yyyy", { locale: id }) : ''}
              </time>
            </div>
          </div>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg"
            />
          )}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
          />
        </article>
      </div>
    </PublicLayout>
  );
};

export default NewsDetailPage;