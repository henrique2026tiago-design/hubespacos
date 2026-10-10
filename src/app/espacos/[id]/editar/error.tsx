"use client";
import Link from "next/link";
export default function ErroGerenciamento({ retry }: { retry: () => void }) {
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <h1>Não foi possível carregar os espaços.</h1>
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
