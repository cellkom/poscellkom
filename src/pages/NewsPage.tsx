import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/use-news";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Image as ImageIcon, Newspaper } from "lucide-react";

const NewsPage = () => {
  const { articles, loading } = useNews();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" /> Berita & Artikel
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Ikuti berita terbaru, tips, dan informasi menarik seputar teknologi dan layanan kami.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
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
                  <Link to={`/news/${article.slug}`} key={article.id} className="block">
                    <Card className="overflow-hidden group transition-shadow hover:shadow-lg flex flex-col h-full">
                      <div className="bg-muted aspect-video flex items-center justify-center overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow flex flex-col">
                        <CardTitle className="text-xl font-semibold line-clamp-2 mb-2">{article.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{article.content}</p>
                        <div className="mt-4 text-xs text-gray-500">
                          Dipublikasikan pada {article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy') : 'N/A'} oleh {article.author_name}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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