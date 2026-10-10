"use client";
import Link from "next/link";
export default function ErroReservas({ retry }: { retry: () => void }) {
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <h1>Não foi possível carregar as reservas.</h1>
      <p>Tente novamente em instantes.</p>
      <div className="acoesFormularioEspaco">
        <button onClick={retry} className="botao botaoVerde">
          Tentar novamente
        </button>
        <Link href="/conta" className="botao botaoNeutro">
          Minha conta
        </Link>
      </div>
    </main>
  );
}
