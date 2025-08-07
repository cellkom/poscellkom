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
    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('advertisements')
      .upload(fileName, file);

    if (error) {
      toast.error('Gagal mengunggah gambar.');
      console.error(error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('advertisements')
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

  const deleteAdvertisement = async (id: string) => {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

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