// Substitui o fakeLoginRequest pela call real.
// Pode integrar com seu BFF (fetch/axios) e tratar erros/códigos.
export async function login(email: string, password: string) {
  // DEMO: mantém a regra atual (senha 123456) — troque pelo seu endpoint
  await new Promise((r) => setTimeout(r, 900));
  if (password !== "123456") {
    const err = new Error("Credenciais inválidas.");
    // @ts-expect-error código opcional
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  return { token: "jwt-token-aqui" };
}
