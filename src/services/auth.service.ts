import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export type LoginResponse = {
  token?: string;
  user: { id: string; email: string | null };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const token = await user.getIdToken();
    return { token, user: { id: user.uid, email: user.email } };
  } catch (e: any) {
    throw new Error(mapAuthError(e?.code));
  }
}

export async function signup(email: string, password: string): Promise<LoginResponse> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const token = await user.getIdToken();
    return { token, user: { id: user.uid, email: user.email } };
  } catch (e: any) {
    throw new Error(mapAuthError(e?.code));
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function listenAuthChanges(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

function mapAuthError(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'E-mail já está em uso.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-disabled':
      return 'Usuário desativado.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Não foi possível realizar a operação.';
  }
}
