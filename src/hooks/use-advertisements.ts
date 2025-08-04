import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Advertisement {
  id: string;
  image_url: string;
  alt_text: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export const useAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvertisements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      showError(`Gagal memuat iklan: ${error.message}`);
    } else {
      setAdvertisements(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const addAdvertisement = async (imageFile: File, altText: string, linkUrl: string) => {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `advertisements/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      showError(`Gagal mengunggah gambar: ${uploadError.message}`);
      return false;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);

    const { error: insertError } = await supabase
      .from('advertisements')
      .insert({
        image_url: publicUrl,
        alt_text: altText || null,
        link_url: linkUrl || null,
      });

    if (insertError) {
      showError(`Gagal menyimpan iklan: ${insertError.message}`);
      return false;
    }

    showSuccess("Iklan berhasil ditambahkan!");
    fetchAdvertisements();
    return true;
  };

  const deleteAdvertisement = async (ad: Advertisement) => {
    const { error: dbError } = await supabase.from('advertisements').delete().eq('id', ad.id);
    if (dbError) {
      showError(`Gagal menghapus iklan: ${dbError.message}`);
      return;
    }

    const imageName = ad.image_url.split('/').pop();
    if (imageName) {
      await supabase.storage.from('product-images').remove([`advertisements/${imageName}`]);
    }

    showSuccess("Iklan berhasil dihapus.");
    fetchAdvertisements();
  };

  return { advertisements, loading, addAdvertisement, deleteAdvertisement, fetchAdvertisements };
};