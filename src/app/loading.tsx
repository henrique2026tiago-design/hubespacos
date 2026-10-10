import { CatalogoSkeleton } from "@/components/catalogoSkeleton";
export default function Loading() {
  return (
    <main id="conteudo" className="container paginaCarregando">
      <p className="sobretitulo">PREPARANDO SEU PRÓXIMO PLANO</p>
      <h1>Carregando espaços…</h1>
      <CatalogoSkeleton />
    </main>
  );
}
