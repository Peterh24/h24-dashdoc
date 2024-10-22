import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.h24transports',
  appName: 'h24-transports-ionic',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    }
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
