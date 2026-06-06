import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.ankerpunkt.app',
  appName: 'Ankerpunkt',
  webDir: 'dist',
  ios: {
    allowsLinkPreview: false,
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#F5F6F8',
  },
  server: {
    allowNavigation: [
      'api.rss2json.com',
      '*.tagesschau.de',
      '*.handelsblatt.com',
      '*.finanzen.net',
      '*.supabase.co',
    ]
  }
};

export default config;
