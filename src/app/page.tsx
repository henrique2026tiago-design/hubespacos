import Link from "next/link";
import { Suspense } from "react";
import { BuscaCatalogo } from "@/components/buscaCatalogo";
import { CartaoEspaco } from "@/components/cartaoEspaco";
import { CatalogoSkeleton } from "@/components/catalogoSkeleton";
import { Icone } from "@/components/icone";
import { ImagemEspaco } from "@/components/imagemEspaco";
import {
  consultarCatalogo,
  consultarResumo,
  validarFiltros,
} from "@/lib/catalogo";
import type { FiltrosCatalogo, ParametrosBusca } from "@/lib/catalogo";

export const runtime = "nodejs";

async function Resultados({ filtros }: { filtros: FiltrosCatalogo }) {
  const espacos = await consultarCatalogo(filtros);
  return (
    <>
      <div className="linhaResultados" role="status">
        <p>
          <strong>{espacos.length}</strong>{" "}
          {espacos.length === 1 ? "espaço encontrado" : "espaços encontrados"}
          {filtros.busca && <> para “{filtros.busca}”</>}
        </p>
        {filtros.busca && (
          <Link href="/#catalogo" scroll={false}>
            Limpar busca
          </Link>
        )}
      </div>
      {espacos.length ? (
        <div className="gradeEspacos">
          {espacos.map((espaco) => (
            <CartaoEspaco key={espaco.id} espaco={espaco} />
          ))}
        </div>
      ) : (
        <div className="estadoVazio">
          <Icone nome="busca" />
          <h3>Nenhum espaço encontrado</h3>
          <p>Tente outro nome, uma característica ou uma cidade.</p>
          <Link href="/#catalogo" className="botao botaoVerde">
            Ver todos os espaços
          </Link>
        </div>
      )}
    </>
  );
}
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusca>;
}) {
  const parametros = await searchParams;
  const validacao = validarFiltros(parametros);
  const filtros: FiltrosCatalogo = validacao.success
    ? validacao.data
    : { busca: "", ordem: "nome" };
  const { total, destaque } = await consultarResumo();
  const sugestoes = [
    ["Todos", ""],
    ["Society", "society"],
    ["Quadras", "quadra"],
    ["Salões", "salão"],
    ["Ao ar livre", "ar livre"],
  ];
  return (
    <main id="conteudo">
      <section className="container hero">
        <div className="textoHero">
          <p className="sobretitulo">
            <span className="tracoVerde" /> O ESPAÇO CERTO FAZ A DIFERENÇA
          </p>
          <h1>
            O encontro é seu.
            <br />O <span>espaço</span>
            <br />
            está aqui.
          </h1>
          <p className="introducao">
            Do jogo entre amigos à sua próxima celebração. Descubra lugares que
            combinam com os seus planos.
          </p>
          <Link href="#catalogo" className="botao botaoVerde">
            Encontre seu espaço <Icone nome="seta" />
          </Link>
          <div className="numeroHero">
            <strong>{String(total).padStart(2, "0")}</strong>
            <span>
              espaços para conhecer
              <br />e imaginar seu próximo encontro
            </span>
          </div>
        </div>
        <div className="visualHero">
          <div className="fotoHero">
            {destaque ? (
              <ImagemEspaco
                src={destaque.imageUrl}
                alt={"Fotografia ilustrativa de " + destaque.name}
                sizes="(max-width: 760px) 100vw, 50vw"
                prioridade
              />
            ) : (
              <div className="fotoIndisponivel">
                <Icone nome="foto" />
                <span>Novos espaços em breve</span>
              </div>
            )}
            <div className="legendaHero">
              <span className="etiquetaHero">CONHEÇA O CATÁLOGO</span>
              <h2>{destaque?.name ?? "Seu próximo encontro"}</h2>
              <p>
                <Icone nome="local" />
                {destaque?.location.split(" (")[0] ??
                  "Espaços para novos planos"}
              </p>
            </div>
          </div>
          <div className="notaHero">
            <span className="iconeNota">
              <Icone nome="check" />
            </span>
            <div>
              <strong>Mais clareza. Melhores planos.</strong>
              <span>Fotos, comodidades e preços em um só lugar.</span>
            </div>
          </div>
        </div>
      </section>
      <div className="faixaBeneficios">
        <div className="container beneficios">
          <div>
            <Icone nome="quadra" />
            <p>
              <strong>Para cada ocasião</strong>
              <span>Esporte, encontros e celebrações</span>
            </p>
          </div>
          <div>
            <Icone nome="pessoas" />
            <p>
              <strong>Do seu tamanho</strong>
              <span>Capacidade e comodidades à vista</span>
            </p>
          </div>
          <div>
            <Icone nome="relogio" />
            <p>
              <strong>Valores transparentes</strong>
              <span>Compare pico e fora de pico</span>
            </p>
          </div>
        </div>
      </div>
      <section id="catalogo" className="container secaoCatalogo">
        <div className="tituloSecao">
          <div>
            <p className="sobretitulo">SEU PRÓXIMO PLANO COMEÇA AQUI</p>
            <h2>Explore os espaços.</h2>
          </div>
          <p>
            Um lugar para cada ideia.
            <br />
            Encontre o que combina com você.
          </p>
        </div>
        <BuscaCatalogo
          key={"formulario-" + JSON.stringify(filtros)}
          busca={filtros.busca}
          ordem={filtros.ordem}
        />
        <nav className="categorias" aria-label="Sugestões de busca">
          {sugestoes.map(([rotulo, termo]) => (
            <Link
              key={rotulo}
              href={
                termo
                  ? "/?busca=" + encodeURIComponent(termo) + "#catalogo"
                  : "/#catalogo"
              }
              scroll={false}
              className={
                filtros.busca === termo ? "categoria ativa" : "categoria"
              }
              aria-current={filtros.busca === termo ? "page" : undefined}
            >
              {rotulo}
            </Link>
          ))}
        </nav>
        {!validacao.success ? (
          <div className="erroValidacao" role="alert">
            <h3>Confira os filtros da busca</h3>
            <p>
              {validacao.error.issues[0]?.path[0] === "ordem"
                ? "Escolha uma opção de ordenação válida."
                : "Use até 120 caracteres na busca."}
            </p>
            <Link href="/#catalogo">Voltar ao catálogo</Link>
          </div>
        ) : (
          <Suspense
            key={"resultados-" + JSON.stringify(filtros)}
            fallback={<CatalogoSkeleton />}
          >
            <Resultados filtros={filtros} />
          </Suspense>
        )}
      </section>
      <section id="comoFunciona" className="comoFunciona">
        <div className="container">
          <div className="tituloSecao">
            <div>
              <p className="sobretitulo">MENOS PROCURA. MAIS POSSIBILIDADES.</p>
              <h2>Comece pelo lugar.</h2>
            </div>
            <p>
              Três passos para tirar
              <br />
              sua próxima ideia do papel.
            </p>
          </div>
          <div className="passos">
            <article>
              <span>01</span>
              <h3>Encontre seu espaço</h3>
              <p>
                Busque pelo nome, cidade ou por uma característica que você
                precisa.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Compare os detalhes</h3>
              <p>
                Confira a capacidade, as comodidades e os valores por hora de
                cada lugar.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Planeje seu encontro</h3>
              <p>
                Escolha o espaço que combina com sua turma e comece a organizar
                seu evento.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
