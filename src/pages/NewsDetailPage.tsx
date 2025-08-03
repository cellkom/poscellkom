import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/use-news";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

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
          setError("Berita tidak ditemukan atau belum dipublikasikan.");
        }
      }
    };
    fetchArticle();
  }, [slug, getArticleBySlug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
          <Button asChild className="mt-4">
            <Link to="/news">Kembali ke Berita</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl text-center">
          <p className="text-muted-foreground">Memuat berita...</p>
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
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl font-bold mb-2">{article.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dipublikasikan pada {article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy, HH:mm') : 'N/A'} oleh {article.author_name}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {article.image_url ? (
              <img src={article.image_url} alt={article.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-6" />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg mb-6">
                <ImageIcon className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p>{article.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default NewsDetailPage;