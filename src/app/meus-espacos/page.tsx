import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { CartaoEspaco } from "@/components/cartaoEspaco";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Meus espaços",
  robots: { index: false, follow: false },
};
const mensagens: Record<string, string> = {
  criado: "Espaço publicado com sucesso.",
  editado: "Alterações salvas com sucesso.",
  excluido: "Espaço excluído com sucesso.",
};
export default async function MeusEspacos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await exigirSessao();
  const parametros = await searchParams;
  const mensagem =
    typeof parametros.resultado === "string"
      ? mensagens[parametros.resultado]
      : undefined;
  const espacos = await obterPrisma().space.findMany({
    where: { ownerId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      capacity: true,
      pricePerHour: true,
      pricePeakHour: true,
      location: true,
      amenities: true,
      imageUrl: true,
    },
  });
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <Link href="/conta" className="voltar">
        ← Minha conta
      </Link>
      <div className="cabecalhoGerenciamento">
        <div>
          <p className="sobretitulo">SEUS LUGARES, SEUS PLANOS</p>
          <h1>Meus espaços</h1>
          <p>
            {espacos.length}{" "}
            {espacos.length === 1 ? "espaço cadastrado" : "espaços cadastrados"}{" "}
            por você.
          </p>
        </div>
        <Link href="/espacos/novo" className="botao botaoVerde">
          + Novo espaço
        </Link>
      </div>
      {mensagem && (
        <p className="sucessoEspaco" role="status">
          {mensagem}
        </p>
      )}
      {espacos.length ? (
        <div className="gradeMeusEspacos">
          {espacos.map((espaco) => (
            <div key={espaco.id} className="itemMeuEspaco">
              <CartaoEspaco espaco={espaco} />
              <Link
                href={`/espacos/${espaco.id}/editar`}
                className="botao botaoNeutro gerenciarEspaco"
              >
                Editar e gerenciar
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <section className="vazioMeusEspacos">
          <p className="sobretitulo">UM PRIMEIRO PASSO</p>
          <h2>Seu próximo espaço começa aqui.</h2>
          <p>
            Adicione as informações e uma foto real. Seu espaço aparecerá no
            catálogo público.
          </p>
          <Link href="/espacos/novo" className="botao botaoVerde">
            Cadastrar meu primeiro espaço
          </Link>
        </section>
      )}
    </main>
  );
}
