import Link from "next/link";
import { formatarPreco, identificarCategoria } from "@/lib/catalogo";
import type { consultarCatalogo } from "@/lib/catalogo";
import { Icone } from "./icone";
import { ImagemEspaco } from "./imagemEspaco";
type Espaco = Awaited<ReturnType<typeof consultarCatalogo>>[number];
export function CartaoEspaco({ espaco }: { espaco: Espaco }) {
  const caminho = "/espacos/" + encodeURIComponent(espaco.id);
  return (
    <article className="cartaoEspaco">
      <Link
        href={caminho}
        className="linkFoto"
        aria-label={"Conhecer " + espaco.name}
        tabIndex={-1}
      >
        <ImagemEspaco
          src={espaco.imageUrl}
          alt={"Fotografia ilustrativa de " + espaco.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
        />
        <span className="etiquetaCategoria">
          {identificarCategoria(espaco.name)}
        </span>
        <span className="setaFoto">
          <Icone nome="seta" />
        </span>
      </Link>
      <div className="conteudoCartao">
        <p className="localCartao">
          <Icone nome="local" />
          {espaco.location.split(" (")[0]}
        </p>
        <h3>
          <Link href={caminho}>{espaco.name}</Link>
        </h3>
        <p className="descricaoCartao">{espaco.description.split(". ")[0]}.</p>
        <p className="capacidadeCartao">
          <Icone nome="pessoas" />
          Até {espaco.capacity} pessoas
        </p>
        <ul className="comodidadesCartao" aria-label="Comodidades">
          {espaco.amenities.slice(0, 2).map((item) => (
            <li key={item}>{item}</li>
          ))}
          {espaco.amenities.length > 2 && (
            <li className="maisComodidades">+{espaco.amenities.length - 2}</li>
          )}
        </ul>
        <div className="baseCartao">
          <div>
            <span className="rotuloPreco">Fora de pico</span>
            <p className="valorPreco">
              {formatarPreco(espaco.pricePerHour)}
              <span> / hora</span>
            </p>
            <span className="precoPico">
              Pico: {formatarPreco(espaco.pricePeakHour)} / hora
            </span>
          </div>
          <Link
            href={caminho}
            className="botaoDetalhe"
            aria-label={"Ver detalhes de " + espaco.name}
          >
            <Icone nome="seta" />
          </Link>
        </div>
      </div>
    </article>
  );
}
