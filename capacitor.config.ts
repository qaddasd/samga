import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.samga.app',
  appName: 'SAMGA',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app.samga.kz'
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'samga'
    }
  },
  plugins: {
    NFC: {
      enabled: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#3B82F6"
    }
  }
};

export default config;
