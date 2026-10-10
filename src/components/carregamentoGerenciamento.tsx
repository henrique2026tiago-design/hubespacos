export function CarregamentoGerenciamento() {
  return (
    <main
      id="conteudo"
      className="container paginaGerenciamento"
      aria-busy="true"
    >
      <p role="status">Preparando os espaços…</p>
      <div className="blocoFormularioEspaco skeletonConteudo">
        <div className="skeleton skeletonLinha" />
        <div className="skeleton skeletonLinha" />
        <div className="skeleton skeletonFoto" />
      </div>
    </main>
  );
}
