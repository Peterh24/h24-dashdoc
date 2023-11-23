import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'h24-transports-ionic',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      "launchShowDuration": 10000,
      "backgroundColor": "#F01713",
      "showSpinner": true,
      "androidSpinnerStyle": "small",
      "iosSpinnerStyle": "small",
      "splashFullScreen": true,
      "splashImmersive": true,
    }
  }
};

export default config;
