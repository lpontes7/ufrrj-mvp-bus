import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export type LoginResponse = {
  token?: string;
  user: { id: string; email: string | null };
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const token = await user.getIdToken();
    console.log("Sucesso ao fazer login");
    console.log("User -> ", user);
    return { token, user: { id: user.uid, email: user.email } };
  } catch (e: any) {
    console.error("Erro ao logar");
    console.error(e);
    throw new Error(mapAuthError(e?.code));
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function listenAuthChanges(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Mapeia erros do Firebase para mensagens amigáveis
function mapAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Usuário desativado.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return "Não foi possível fazer login. Verifique suas credenciais.";
  }
}
