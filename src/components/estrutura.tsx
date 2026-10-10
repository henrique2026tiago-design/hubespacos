import Link from "next/link";
import { Icone } from "./icone";
export function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="container linhaCabecalho">
        <Link href="/" className="marca" aria-label="HubEspaços — início">
          <span className="simboloMarca">
            <Icone nome="quadra" />
          </span>
          <span>
            Hub<span className="marcaVerde">Espaços</span>
            <span className="pontoMarca">.</span>
          </span>
        </Link>
        <nav className="menuPrincipal" aria-label="Navegação principal">
          <Link href="/#catalogo" className="linkMenu">
            Explorar espaços
          </Link>
          <Link href="/#comoFunciona" className="linkMenu linkSecundario">
            Como funciona
          </Link>
        </nav>
        <span className="seloCabecalho">
          <span className="pontoVerde" /> Seu próximo encontro começa aqui
        </span>
      </div>
    </header>
  );
}
export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container linhaRodape">
        <Link href="/" className="marca marcaRodape">
          Hub<span className="marcaVerde">Espaços</span>.
        </Link>
        <p>Lugares para jogar, celebrar e se encontrar.</p>
        <Link href="/#catalogo">
          Explorar catálogo <Icone nome="seta" />
        </Link>
      </div>
      <div className="container notaAcademica">
        Projeto acadêmico · IFES · Catálogo demonstrativo com espaços e
        endereços fictícios.
      </div>
    </footer>
  );
}
