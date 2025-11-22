import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleLoginOptions {
  onSuccess?: (user: User) => void;
  onError?: (message: string) => void;
}

export function useGoogleLogin(options: UseGoogleLoginOptions = {}) {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);

  // IDs vindos do app.config.ts → extra.google
  const clientId = Constants.expoConfig?.extra?.google?.expoClientId as
    | string
    | undefined;
  const androidClientId = Constants.expoConfig?.extra?.google?.androidClientId as
    | string
    | undefined;

  if (!clientId) {
    console.warn(
      '⚠️ expoClientId de Google Login ausente em extra.google.expoClientId (app.config.ts).',
    );
  }
  if (!androidClientId) {
    console.warn(
      '⚠️ androidClientId de Google Login ausente em extra.google.androidClientId (app.config.ts).',
    );
  }

  // 🔥 Detecta se está rodando no Expo Go
  // appOwnership existe em runtime no Expo Go; em APK costuma ser null/undefined
  const appOwnership = (Constants as any).appOwnership as
    | 'expo'
    | 'standalone'
    | 'guest'
    | null
    | undefined;
  const isExpoGo = appOwnership === 'expo';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId, // Expo/Web client (usado no Expo Go)
    androidClientId, // client Android (usado no APK)
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (!response) return;

      if (response.type === 'success') {
        try {
          setIsLoading(true);

          const idToken = response.authentication?.idToken;
          if (!idToken) {
            throw new Error('Token do Google inválido.');
          }

          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);

          console.log('User -> ', result.user);

          onSuccess?.(result.user);
        } catch (e: any) {
          const message = e?.message || 'Não foi possível entrar com Google.';
          onError?.(message);
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === 'error') {
        onError?.('Falha ao entrar com Google. Tente novamente.');
      }
    };

    handleGoogleResponse();
  }, [response, onSuccess, onError]);

  const startGoogleLogin = () => {
    if (!request) return;

    setIsLoading(true);

    // 👉 Expo Go → useProxy = true
    // 👉 APK standalone → useProxy = false
    (promptAsync as any)({ useProxy: isExpoGo }).catch(() => {
      setIsLoading(false);
    });
  };

  return {
    startGoogleLogin,
    isLoading,
    request,
  };
}
