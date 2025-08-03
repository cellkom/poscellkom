import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AppSetting {
  key: string;
  value: string | null;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching app settings:', error);
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string): string | null => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : null;
  };

  return { settings, loading, getSetting };
};