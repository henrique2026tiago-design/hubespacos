export function CarregamentoReservas() {
  return (
    <main
      id="conteudo"
      className="container paginaGerenciamento"
      aria-busy="true"
    >
      <p role="status">Carregando reservas…</p>
      {[1, 2, 3].map((i) => (
        <div className="blocoFormularioEspaco" key={i}>
          <div className="skeleton skeletonLinha" />
          <div className="skeleton skeletonLinha" />
        </div>
      ))}
    </main>
  );
}
