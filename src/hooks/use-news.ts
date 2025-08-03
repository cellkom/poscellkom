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
    // Changed from 'product-images' to 'news-images'
    const { error, data } = await supabase.storage.from('news-images').upload(fileName, imageFile);
    if (error) {
      showError(`Gagal mengunggah gambar: ${error.message}`);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('news-images').getPublicUrl(data.path);
    return publicUrl;
  };

  const deleteNewsImage = async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl) return true; // Nothing to delete
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1]; // Get the file name from the URL
      const filePath = `news/${fileName}`; // Reconstruct the path in the bucket

      const { error } = await supabase.storage.from('news-images').remove([filePath]);
      if (error) {
        console.error("Error deleting old news image:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error parsing image URL for deletion:", e);
      return false;
    }
  };

  const addArticle = async (newArticleData: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at' | 'author_name'>, imageFile: File | null) => {
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadNewsImage(imageFile);
      if (!imageUrl) return null;
    }

    const { data, error } = await supabase
      .from('news')
      .insert({ ...newArticleData, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah berita: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Berita baru berhasil ditambahkan!");
    fetchArticles(true); // Refresh for admin view
    return data;
  };

  const updateArticle = async (id: string, updatedFields: Partial<Omit<NewsArticle, 'id' | 'created_at' | 'updated_at' | 'author_name'>>, imageFile: File | null) => {
    let imageUrl = updatedFields.image_url;

    if (imageFile) {
      const oldArticle = articles.find(a => a.id === id);
      if (oldArticle?.image_url) {
        await deleteNewsImage(oldArticle.image_url); // Delete old image if exists
      }
      const newImageUrl = await uploadNewsImage(imageFile);
      if (newImageUrl) {
        imageUrl = newImageUrl;
      } else {
        // If new image upload fails, keep the old image URL or set to null if it was meant to be removed
        imageUrl = oldArticle?.image_url || null;
      }
    } else if (updatedFields.image_url === null && articles.find(a => a.id === id)?.image_url) {
      // If image_url is explicitly set to null and there was an old image
      await deleteNewsImage(articles.find(a => a.id === id)?.image_url || '');
    }

    const { data, error } = await supabase
      .from('news')
      .update({ ...updatedFields, image_url: imageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui berita: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Berita berhasil diperbarui!");
    fetchArticles(true); // Refresh for admin view
    return data;
  };

  const deleteArticle = async (id: string) => {
    const articleToDelete = articles.find(a => a.id === id);
    if (articleToDelete?.image_url) {
      await deleteNewsImage(articleToDelete.image_url);
    }

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      showError(`Gagal menghapus berita: ${error.message}`);
      console.error(error);
      return false;
    }
    showSuccess("Berita berhasil dihapus!");
    fetchArticles(true); // Refresh for admin view
    return true;
  };

  useEffect(() => {
    fetchArticles(); // Initial fetch for public view
  }, [fetchArticles]);

  return { articles, loading, fetchArticles, getArticleBySlug, uploadNewsImage, addArticle, updateArticle, deleteArticle };
};