import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { z } from "zod";
import { obterPrisma } from "./prisma";
import { esquemaCadastro, esquemaLogin } from "./validacaoAuth";

const esquemaAmbiente = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z
    .string()
    .url()
    .refine((valor) => {
      const url = new URL(valor);
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      return (
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        url.pathname === "/" &&
        (url.protocol === "https:" || (local && url.protocol === "http:"))
      );
    }),
});
function criarAuth() {
  const validacao = esquemaAmbiente.safeParse(process.env);
  if (!validacao.success)
    throw new Error(
      "Confira BETTER_AUTH_URL e BETTER_AUTH_SECRET no ambiente do servidor.",
    );
  const origem = new URL(validacao.data.BETTER_AUTH_URL).origin;
  return betterAuth({
    appName: "HubEspaços",
    baseURL: origem,
    secret: validacao.data.BETTER_AUTH_SECRET,
    trustedOrigins: [origem],
    database: prismaAdapter(obterPrisma(), {
      provider: "postgresql",
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    hooks: {
      // Validação também cobre quem chama a API diretamente, sem o formulário.
      before: createAuthMiddleware(async (contexto) => {
        if (
          contexto.path !== "/sign-up/email" &&
          contexto.path !== "/sign-in/email"
        )
          return;
        const resultado =
          contexto.path === "/sign-up/email"
            ? esquemaCadastro.safeParse(contexto.body)
            : esquemaLogin.safeParse(contexto.body);
        if (!resultado.success) {
          throw new APIError("BAD_REQUEST", {
            code: "VALIDATION_ERROR",
            message: resultado.error.issues[0].message,
          });
        }
        // Mantém campos do Better Auth e normaliza nome/e-mail; não altera senhas.
        return { context: { body: { ...contexto.body, ...resultado.data } } };
      }),
    },
    plugins: [nextCookies()],
  });
}
// Inicialização preguiçosa: o build não exige segredo nem abre conexão de autenticação.
let instancia: ReturnType<typeof criarAuth> | undefined;
export function obterAuth() {
  instancia ??= criarAuth();
  return instancia;
}
