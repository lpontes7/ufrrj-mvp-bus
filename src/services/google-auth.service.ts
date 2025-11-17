import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth } from "../config/firebase";

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleLoginOptions {
  onSuccess?: (user: User) => void;
  onError?: (message: string) => void;
}

export function useGoogleLogin(options: UseGoogleLoginOptions = {}) {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;

  if (!clientId) {
    console.warn(
      "⚠️ EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ausente. Verifique o arquivo .env"
    );
  }

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (!response) return;

      if (response.type === "success") {
        try {
          setIsLoading(true);

          const idToken = response.authentication?.idToken;
          if (!idToken) {
            throw new Error("Token do Google inválido.");
          }

          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);

          console.log("User -> ", result.user);

          onSuccess?.(result.user);
        } catch (e: any) {
          const message = e?.message || "Não foi possível entrar com Google.";
          onError?.(message);
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === "error") {
        onError?.("Falha ao entrar com Google. Tente novamente.");
      }
    };

    handleGoogleResponse();
  }, [response, onSuccess, onError]);

  const startGoogleLogin = () => {
    if (!request) return;

    setIsLoading(true);
    (promptAsync as any)({ useProxy: true }).catch(() => {
      setIsLoading(false);
    });
  };

  return {
    startGoogleLogin,
    isLoading,
    request,
  };
}
