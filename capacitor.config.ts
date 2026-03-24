import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.musulunci',
  appName: 'Musulunci',
  webDir: 'dist',
  server: {
    url: 'https://61432091-060d-4533-b845-f962cf167bd1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
