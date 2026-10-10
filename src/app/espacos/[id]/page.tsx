import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  consultarEspaco,
  formatarPreco,
  identificarCategoria,
} from "@/lib/catalogo";
import { Icone } from "@/components/icone";
import { ImagemEspaco } from "@/components/imagemEspaco";
export const runtime = "nodejs";
export default async function Detalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Consulta atualizada por requisição, sem congelar dados do banco no build.
  await connection();
  const { id } = await params;
  const espaco = await consultarEspaco(id);
  if (!espaco) notFound();
  return (
    <main id="conteudo" className="container paginaDetalhe">
      <Link href="/#catalogo" className="voltar">
        <Icone nome="voltar" />
        Voltar ao catálogo
      </Link>
      <div className="tituloDetalhe">
        <p className="sobretitulo">{identificarCategoria(espaco.name)}</p>
        <h1>{espaco.name}</h1>
        <p className="localDetalhe">
          <Icone nome="local" />
          {espaco.location}
        </p>
      </div>
      <div className="fotoDetalhe">
        <ImagemEspaco
          src={espaco.imageUrl}
          alt={"Fotografia ilustrativa de " + espaco.name}
          sizes="(max-width: 1200px) 100vw, 1120px"
          prioridade
        />
      </div>
      <div className="colunasDetalhe">
        <div>
          <section className="secaoDetalhe">
            <h2>Um lugar para seus planos</h2>
            <p className="descricaoDetalhe">{espaco.description}</p>
            <p className="capacidadeDetalhe">
              <Icone nome="pessoas" />
              Capacidade para até <strong>{espaco.capacity} pessoas</strong>
            </p>
          </section>
          <section className="secaoDetalhe">
            <h2>O que este espaço oferece</h2>
            <ul className="listaComodidades">
              {espaco.amenities.map((item) => (
                <li key={item}>
                  <Icone nome="check" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="quadroValores" aria-labelledby="tituloValores">
          <p className="sobretitulo">PLANEJE COM CLAREZA</p>
          <h2 id="tituloValores">Valores por hora</h2>
          <dl>
            <div>
              <dt>Fora de pico</dt>
              <dd>{formatarPreco(espaco.pricePerHour)}</dd>
            </div>
            <div>
              <dt>Horário de pico</dt>
              <dd>{formatarPreco(espaco.pricePeakHour)}</dd>
            </div>
          </dl>
          <p>
            Valores de referência por hora. Consulte a descrição para os
            horários de pico e as condições de cancelamento.
          </p>
          <Link href="/#catalogo" className="botao botaoVerde">
            Comparar outros espaços <Icone nome="seta" />
          </Link>
        </aside>
      </div>
    </main>
  );
}
