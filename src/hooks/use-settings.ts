import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface AppSettings {
  [key: string]: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('key, value');

    if (error) {
      showError(`Gagal memuat pengaturan: ${error.message}`);
    } else {
      const settingsObject = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as AppSettings);
      setSettings(settingsObject);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
    const channel = supabase
      .channel('app-settings-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSettings = async (settingsToUpdate: AppSettings) => {
    const updates = Object.entries(settingsToUpdate).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('app_settings').upsert(updates);

    if (error) {
      showError(`Gagal menyimpan pengaturan: ${error.message}`);
      return false;
    }
    showSuccess("Pengaturan berhasil disimpan!");
    setSettings(prev => ({ ...prev, ...settingsToUpdate }));
    return true;
  };

  const uploadLogo = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `public/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      showError(`Gagal mengunggah logo: ${uploadError.message}`);
      return false;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return updateSettings({ logoUrl: publicUrl });
  };

  return { settings, loading, fetchSettings, updateSettings, uploadLogo };
};