export default function Loading() {
  return (
    <main id="conteudo" className="container paginaAuth" aria-busy="true">
      <div className="apresentacaoAuth">
        <p className="sobretitulo">CARREGANDO</p>
        <h1>Preparando sua conta…</h1>
      </div>
      <div className="quadroAuth" aria-hidden="true">
        <div className="skeleton skeletonLinha curta" />
        <div className="skeleton skeletonLinha" />
        <div className="skeleton skeletonPreco" />
        <div className="skeleton skeletonPreco" />
        <div className="skeleton skeletonPreco" />
      </div>
      <span className="somenteLeitor" role="status">
        Carregando sua conta.
      </span>
    </main>
  );
}
