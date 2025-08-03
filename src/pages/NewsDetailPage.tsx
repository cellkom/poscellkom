import PublicLayout from "@/components/Layout/PublicLayout";
import { useParams, Link } from "react-router-dom";
import { useNews } from "@/hooks/use-news";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarDays, User, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getArticleBySlug, loading } = useNews();
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (slug) {
        const fetchedArticle = await getArticleBySlug(slug);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError("Artikel tidak ditemukan atau belum dipublikasikan.");
        }
      }
    };
    fetchArticle();
  }, [slug, getArticleBySlug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl text-center">
          <Card>
            <CardHeader><CardTitle>Oops!</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg text-destructive">{error}</p>
              <Button asChild className="mt-4">
                <Link to="/news">Kembali ke Berita</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl text-center">
          <p className="text-lg text-muted-foreground">Artikel tidak ditemukan.</p>
          <Button asChild className="mt-4">
            <Link to="/news">Kembali ke Berita</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Button variant="outline" asChild className="mb-6">
          <Link to="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Berita
          </Link>
        </Button>

        <Card>
          <CardHeader className="p-0">
            {article.image_url ? (
              <img src={article.image_url} alt={article.title} className="w-full h-64 object-cover rounded-t-lg" />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-lg">
                <ImageIcon className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-6 space-x-4">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy') : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author_name || 'Admin'}
              </span>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none text-foreground">
              <p>{article.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default NewsDetailPage;