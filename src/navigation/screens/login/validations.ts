export const emailRegex = /\S+@\S+\.\S+/;

export function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) return "Informe seu e-mail.";
  if (!emailRegex.test(email.trim())) return "E-mail inválido.";
  if (!password) return "Informe sua senha.";
  if (password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
  return null;
}
