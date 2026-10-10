"use client";
export default function Error({ retry }: { retry: () => void }) {
  return (
    <main id="conteudo" className="container paginaEstado" role="alert">
      <p className="sobretitulo">VAMOS TENTAR DE NOVO</p>
      <h1>Não foi possível acessar sua conta.</h1>
      <p>
        O serviço está temporariamente indisponível. Tente novamente em
        instantes.
      </p>
      <button className="botao botaoVerde" onClick={() => retry()}>
        Tentar novamente
      </button>
    </main>
  );
}
