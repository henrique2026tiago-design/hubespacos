"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authCliente } from "@/lib/authCliente";

export function ControlesConta() {
  const { data: sessao, isPending } = authCliente.useSession();
  const router = useRouter();
  const [saindo, definirSaindo] = useState(false);
  const [erro, definirErro] = useState("");
  async function sair() {
    definirErro("");
    definirSaindo(true);
    try {
      const resposta = await authCliente.signOut();
      if (resposta.error) {
        definirErro("Não foi possível sair. Tente novamente.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      definirErro("Não foi possível sair. Tente novamente.");
    } finally {
      definirSaindo(false);
    }
  }
  return (
    <div className="controlesConta">
      {isPending ? (
        <span className="carregandoConta" role="status">
          Verificando conta…
        </span>
      ) : sessao ? (
        <>
          <Link
            href="/conta"
            className="linkMinhaConta"
            aria-label="Abrir minha conta"
          >
            Minha conta
          </Link>
          <button onClick={sair} className="botaoSair" disabled={saindo}>
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </>
      ) : (
        <Link href="/login" className="linkEntrar">
          Entrar <span aria-hidden="true">↗</span>
        </Link>
      )}
      {erro && (
        <span className="erroSair" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}
