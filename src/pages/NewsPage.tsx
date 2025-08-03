import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/use-news";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Image as ImageIcon, CalendarDays, User } from "lucide-react";

const NewsPage = () => {
  const { articles, loading } = useNews();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Berita & Artikel Terbaru</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Ikuti perkembangan terbaru, tips, dan informasi menarik seputar teknologi dan layanan kami.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {articles.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p className="text-lg">Belum ada berita yang dipublikasikan.</p>
                <p className="text-sm">Nantikan update terbaru dari kami!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden group transition-shadow hover:shadow-lg flex flex-col">
                    <CardHeader className="p-0">
                      <div className="bg-muted aspect-video flex items-center justify-center overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <h3 className="font-semibold text-lg line-clamp-2" title={article.title}>{article.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-2 mb-3 space-x-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.author_name || 'Admin'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.content}</p>
                      <Link to={`/news/${article.slug}`} className="text-primary hover:underline mt-auto font-medium">
                        Baca Selengkapnya &rarr;
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default NewsPage;