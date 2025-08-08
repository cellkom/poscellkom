import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Advertisement } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useAdvertisements = (placement?: string) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvertisements = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('advertisements')
      .select('*')
      .order('sort_order');

    if (placement) {
      query = query.eq('placement', placement).eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal memuat data iklan.');
      console.error(error);
    } else {
      setAdvertisements(data as Advertisement[]);
    }
    setLoading(false);
  }, [placement]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `advertisements/${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      toast.error(`Gagal mengunggah gambar: ${error.message}`);
      console.error(error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const addAdvertisement = async (adData: Omit<Advertisement, 'id' | 'created_at'>, imageFile: File | null) => {
    let imageUrl = adData.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) return null;
      imageUrl = uploadedUrl;
    }

    const { data, error } = await supabase
      .from('advertisements')
      .insert([{ ...adData, image_url: imageUrl }])
      .select()
      .single();

    if (error) {
      toast.error('Gagal menambah iklan baru.');
      console.error(error);
      return null;
    }
    toast.success('Iklan berhasil ditambahkan.');
    fetchAdvertisements();
    return data;
  };

  const updateAdvertisement = async (id: string, adData: Partial<Advertisement>, imageFile: File | null) => {
    let imageUrl = adData.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) return null;
      imageUrl = uploadedUrl;
    }

    const { data, error } = await supabase
      .from('advertisements')
      .update({ ...adData, image_url: imageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Gagal memperbarui iklan.');
      console.error(error);
      return null;
    }
    toast.success('Iklan berhasil diperbarui.');
    fetchAdvertisements();
    return data;
  };

  const deleteAdvertisement = async (ad: Advertisement) => {
    if (ad.image_url) {
      try {
        const url = new URL(ad.image_url);
        const imagePath = url.pathname.split('/product-images/')[1];
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([imagePath]);
          if (storageError) {
            console.error("Gagal menghapus gambar dari storage:", storageError);
            toast.error("Gagal menghapus file gambar, tapi iklan akan tetap dihapus dari database.");
          }
        }
      } catch (e) {
        console.error("URL gambar tidak valid, tidak dapat menghapus dari storage:", ad.image_url);
      }
    }

    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', ad.id);

    if (error) {
      toast.error('Gagal menghapus iklan.');
      console.error(error);
      return false;
    }
    toast.success('Iklan berhasil dihapus.');
    fetchAdvertisements();
    return true;
  };

  return { advertisements, loading, fetchAdvertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement };
};