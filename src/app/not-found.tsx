import Link from "next/link";
export default function NotFound() {
  return (
    <main id="conteudo" className="container paginaEstado">
      <p className="sobretitulo">ESPAÇO NÃO ENCONTRADO</p>
      <h1>Este espaço não está no catálogo.</h1>
      <p>Explore os outros lugares disponíveis para o seu próximo encontro.</p>
      <Link href="/#catalogo" className="botao botaoVerde">
        Voltar ao catálogo
      </Link>
    </main>
  );
}
