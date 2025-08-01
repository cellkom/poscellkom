import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

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
  author_name?: string; // Optional: for displaying author name
}

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async (adminMode = false) => {
    setLoading(true);
    let query = supabase.from('news').select(`
      *,
      author:users ( full_name )
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
  }, []);

  const getArticleBySlug = async (slug: string): Promise<NewsArticle | null> => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:users ( full_name )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .single();
    
    setLoading(false);
    if (error) {
      console.error("Error fetching article by slug:", error);
      return null;
    }
    return data ? { ...data, author_name: data.author?.full_name || 'Tanpa Nama' } : null;
  };

  const uploadNewsImage = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `news/${Date.now()}.${fileExt}`;
    const { error, data } = await supabase.storage.from('product-images').upload(fileName, imageFile);
    if (error) {
      showError(`Gagal mengunggah gambar: ${error.message}`);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return publicUrl;
  };

  return { articles, loading, fetchArticles, getArticleBySlug, uploadNewsImage };
};