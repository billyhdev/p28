export default {
  expo: {
    name: 'P28',
    slug: 'blue-ocean-platform',
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
      'expo-router',
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#232323",
          "image": "./assets/splash-icon.png",
          "dark": {
            "image": "./assets/splash-icon.png",
            "backgroundColor": "#000000"
          },
          "imageWidth": 200
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '2685a3df-7455-482a-85d4-07b886ae58ec'
      }
    }
  }
};
