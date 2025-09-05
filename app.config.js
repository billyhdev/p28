export default {
  expo: {
    name: 'P28',
    slug: 'p28',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.blueocean.p28'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      package: 'com.blueocean.p28'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    scheme: 'p28',
    plugins: [
      'expo-router'
    ],
    extra: {
      eas: {
        projectId: 'your-project-id'
      }
    }
  }
};
