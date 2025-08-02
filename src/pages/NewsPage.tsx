import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/use-news";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, User, Image as ImageIcon } from "lucide-react";

const NewsPage = () => {
  const { articles, loading, fetchArticles } = useNews();

  useEffect(() => {
    fetchArticles(); // Fetch only published articles
  }, [fetchArticles]);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Berita & Informasi</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ikuti terus berita terbaru, tips & trik, dan informasi seputar layanan kami.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="p-0">
                  <Skeleton className="h-52 w-full" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-4 pt-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Belum Ada Berita</h2>
            <p className="mt-2 text-muted-foreground">Silakan kembali lagi nanti untuk melihat informasi terbaru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link to={`/news/${article.slug}`} key={article.id} className="group">
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{article.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{article.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{article.published_at ? format(new Date(article.published_at), "d MMMM yyyy", { locale: id }) : ''}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3">
                      {article.content.substring(0, 120)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default NewsPage;