import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { obterAuth } from "./auth";

// cache() memoiza somente dentro da requisição; sessões não são compartilhadas entre usuários.
export const obterSessao = cache(async () => {
  return obterAuth().api.getSession({ headers: await headers() });
});
export async function exigirSessao() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/login");
  return sessao;
}
