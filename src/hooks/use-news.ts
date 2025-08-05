import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface NewsArticle {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  image_url: string | null;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  author_id: string | null;
  author_name?: string;
}

interface NewsContextType {
  articles: NewsArticle[];
  loading: boolean;
  fetchArticles: (adminMode?: boolean) => Promise<void>;
  getArticleBySlug: (slug: string) => Promise<NewsArticle | null>;
  uploadNewsImage: (imageFile: File) => Promise<string | null>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async (adminMode = false) => {
    if (adminMode && !user) {
      setArticles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase.from('news').select(`
      *,
      author:user_profiles ( full_name )
    `);

    if (!adminMode) {
      query = query
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat berita: ${error.message}`);
      console.error(error);
    } else {
      const formattedData = data.map((article: any) => ({
        ...article,
        author_name: article.author?.full_name || 'Tanpa Nama',
      }));
      setArticles(formattedData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Initial fetch for public articles
    fetchArticles(false);

    const channel = supabase
      .channel('news-channel-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => {
          // When a change happens, refetch public articles.
          fetchArticles(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchArticles]);

  const getArticleBySlug = useCallback(async (slug: string): Promise<NewsArticle | null> => {
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:user_profiles ( full_name )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .single();
    
    if (error) {
      console.error("Error fetching article by slug:", error);
      return null;
    }
    return data ? { ...data, author_name: data.author?.full_name || 'Tanpa Nama' } : null;
  }, []);

  const uploadNewsImage = useCallback(async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `news/${Date.now()}.${fileExt}`;
    const { error, data } = await supabase.storage.from('product-images').upload(fileName, imageFile, { upsert: true });
    if (error) {
      showError(`Gagal mengunggah gambar: ${error.message}`);
      return null;
    }
    if (!data?.path) {
      showError('Gagal mendapatkan path gambar setelah unggah.');
      return null;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  }, []);

  const value = { articles, loading, fetchArticles, getArticleBySlug, uploadNewsImage };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};