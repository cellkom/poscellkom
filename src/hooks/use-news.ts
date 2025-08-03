import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext'; // To get current user ID

export interface News {
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
}

export const useNews = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching news:", error);
      setError(error.message);
      showError("Gagal memuat berita.");
    } else {
      setNews(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `news_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news_images') // Assuming you have a bucket named 'news_images'
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      showError("Gagal mengunggah gambar.");
      return null;
    }

    const { data } = supabase.storage
      .from('news_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const deleteImage = async (imageUrl: string | null) => {
    if (!imageUrl) return;

    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `news_images/${fileName}`;

      const { error } = await supabase.storage
        .from('news_images')
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        showError("Gagal menghapus gambar lama.");
      }
    } catch (e) {
      console.error("Error parsing image URL for deletion:", e);
    }
  };

  const addNews = async (newNews: Omit<News, 'id' | 'created_at' | 'updated_at' | 'author_id'>, imageFile: File | null) => {
    setLoading(true);
    setError(null);
    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (imageUrl === null) {
        setLoading(false);
        return false;
      }
    }

    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newNews,
        image_url: imageUrl,
        author_id: user?.id || null, // Set author_id from current user
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding news:", error);
      setError(error.message);
      showError("Gagal menambah berita.");
      if (imageUrl) await deleteImage(imageUrl); // Clean up uploaded image if DB insert fails
      setLoading(false);
      return false;
    } else {
      setNews((prev) => [data, ...prev]);
      showSuccess("Berita berhasil ditambahkan!");
      setLoading(false);
      return true;
    }
  };

  const updateNews = async (id: string, updatedFields: Partial<Omit<News, 'created_at' | 'updated_at'>>, imageFile: File | null, oldImageUrl: string | null) => {
    setLoading(true);
    setError(null);
    let imageUrl: string | null = oldImageUrl;

    if (imageFile) {
      // Upload new image
      const newImageUrl = await uploadImage(imageFile);
      if (newImageUrl === null) {
        setLoading(false);
        return false;
      }
      imageUrl = newImageUrl;
      // Delete old image if a new one was uploaded and old one existed
      if (oldImageUrl) {
        await deleteImage(oldImageUrl);
      }
    } else if (updatedFields.image_url === null && oldImageUrl) {
      // If image_url is explicitly set to null and there was an old image, delete it
      await deleteImage(oldImageUrl);
      imageUrl = null;
    }

    const { data, error } = await supabase
      .from('news')
      .update({ ...updatedFields, image_url: imageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating news:", error);
      setError(error.message);
      showError("Gagal memperbarui berita.");
      setLoading(false);
      return false;
    } else {
      setNews((prev) => prev.map((n) => (n.id === id ? data : n)));
      showSuccess("Berita berhasil diperbarui!");
      setLoading(false);
      return true;
    }
  };

  const deleteNews = async (id: string, imageUrl: string | null) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting news:", error);
      setError(error.message);
      showError("Gagal menghapus berita.");
      setLoading(false);
      return false;
    } else {
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      setNews((prev) => prev.filter((n) => n.id !== id));
      showSuccess("Berita berhasil dihapus!");
      setLoading(false);
      return true;
    }
  };

  return { news, loading, error, fetchNews, addNews, updateNews, deleteNews };
};