import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.h24transports',
  appName: 'H24 Transports',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: [
//      'p.monetico-services.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
