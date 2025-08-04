import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface AppSettings {
  [key: string]: string;
  consultationLink?: string; // New field for consultation link
  socialFacebook?: string; // New field for Facebook link
  socialYoutube?: string; // New field for YouTube link
  socialTiktok?: string; // New field for TikTok link
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (settingsToUpdate: AppSettings) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
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

  const updateSettings = async (settingsToUpdate: AppSettings): Promise<boolean> => {
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

  const uploadLogo = async (file: File): Promise<boolean> => {
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
    const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;
    return updateSettings({ logoUrl: finalUrl });
  };

  const value = { settings, loading, updateSettings, uploadLogo };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};