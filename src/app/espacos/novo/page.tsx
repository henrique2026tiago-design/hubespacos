import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { FormularioEspaco } from "@/components/formularioEspaco";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Novo espaço",
  robots: { index: false, follow: false },
};
export default async function NovoEspaco() {
  await exigirSessao();
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <Link href="/meus-espacos" className="voltar">
        ← Meus espaços
      </Link>
      <div className="cabecalhoGerenciamento">
        <div>
          <p className="sobretitulo">NOVO ESPAÇO</p>
          <h1>Um lugar para novos planos.</h1>
          <p>Cadastre uma quadra, salão ou espaço de encontros.</p>
        </div>
      </div>
      <FormularioEspaco />
    </main>
  );
}
