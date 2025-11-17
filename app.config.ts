export default {
  expo: {
    name: "ufrrj-bus-tracker",
    slug: "ufrrj-mvp-bus",
    scheme: "ufrrjbus",
    owner: "lpontes7",
    android: {
      package: "br.ufrrj.bus",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
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
        projectId: "f636fbad-8d5c-4b09-b2be-dc142a972906",
      },
      google: {
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      },
    },
  },
};
