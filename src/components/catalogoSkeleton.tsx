export function CatalogoSkeleton() {
  return (
    <div
      className="gradeEspacos"
      aria-busy="true"
      aria-label="Carregando espaços"
    >
      {Array.from({ length: 6 }, (_, indice) => (
        <div className="cartaoSkeleton" key={indice} aria-hidden="true">
          <div className="skeleton skeletonFoto" />
          <div className="skeletonConteudo">
            <div className="skeleton skeletonLinha" />
            <div className="skeleton skeletonLinha curta" />
            <div className="skeleton skeletonLinha" />
            <div className="skeleton skeletonPreco" />
          </div>
        </div>
      ))}
      <span className="somenteLeitor">Carregando espaços...</span>
    </div>
  );
}
