"use client";
export default function Error({ retry }: { retry: () => void }) {
  return (
    <main id="conteudo" className="container paginaEstado" role="alert">
      <p className="sobretitulo">VAMOS TENTAR DE NOVO</p>
      <h1>Não foi possível carregar os espaços.</h1>
      <p>
        O catálogo está temporariamente indisponível. Tente novamente em
        instantes.
      </p>
      <button onClick={() => retry()} className="botao botaoVerde">
        Tentar novamente
      </button>
    </main>
  );
}
