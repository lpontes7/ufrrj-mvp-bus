import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  //@ts-ignore
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database, getDatabase } from 'firebase/database';

const extra = Constants.expoConfig?.extra as any;
const firebaseConfig = extra?.firebase;

if (!firebaseConfig?.apiKey) {
  console.warn('⚠️ Firebase config ausente. Verifique app.config.ts e variáveis .env');
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

let auth: Auth;
let db: Database;

try {
  db = getDatabase(app);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth, db };
