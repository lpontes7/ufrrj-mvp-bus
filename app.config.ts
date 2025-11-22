export default {
  expo: {
    name: 'ufrrj-bus-tracker',
    slug: 'ufrrj-mvp-bus',
    icon: './src/assets/images/little-ghost-logo.png',
    scheme: 'ufrrjbus',
    owner: 'lpontes7',
    android: {
      package: 'br.ufrrj.bus',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_MAPS_KEY,
        },
      },
    },
    extra: {
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      eas: {
        projectId:process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
      google: {
        expoClientId:
          process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        androidClientId:
          process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      },
    },
  },
};
