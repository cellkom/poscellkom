import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useNews } from "@/hooks/use-news";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, Calendar, User } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const NewsPage = () => {
  const { articles, loading } = useNews();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Berita & Informasi</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ikuti perkembangan terbaru, tips & trik, serta promo menarik dari Cellkom.Store.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
              articles.map(article => (
                <Card key={article.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
                  <CardHeader className="p-0">
                    <Link to={`/news/${article.slug}`} className="block">
                      <div className="bg-muted aspect-video flex items-center justify-center overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 flex-grow">
                    <Link to={`/news/${article.slug}`} className="block">
                      <CardTitle className="text-xl line-clamp-2" title={article.title}>{article.title}</CardTitle>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> {article.author_name}</div>
                      <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {format(new Date(article.published_at!), 'd MMMM yyyy', { locale: id })}</div>
                    </div>
                    <CardDescription className="mt-3 line-clamp-3">
                      {article.content?.substring(0, 150)}...
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0">
                    <Button asChild className="w-full">
                      <Link to={`/news/${article.slug}`}>Baca Selengkapnya</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground text-lg">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default NewsPage;