import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { FormularioAuth } from "@/components/formularioAuth";
import { MolduraAuth } from "@/components/molduraAuth";
export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};
export default async function Login() {
  if (await obterSessao()) redirect("/conta");
  return (
    <MolduraAuth>
      <FormularioAuth modo="login" />
    </MolduraAuth>
  );
}
