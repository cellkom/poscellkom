import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/contexts/SettingsContext';

const HeadManager: React.FC = () => {
  const { settings } = useSettings();

  const appName = settings.appName || 'Cellkom.Store';
  const appDescription = settings.appDescription || 'Pusat Service HP dan Komputer';
  const logoUrl = settings.logoUrl || '/logo.png'; // Default to public/logo.png

  return (
    <Helmet>
      <title>{appName} - {appDescription}</title>
      <link rel="icon" type="image/png" href={logoUrl} />
      <meta name="description" content={appDescription} />
      {/* You can add more meta tags here if needed */}
    </Helmet>
  );
};

export default HeadManager;