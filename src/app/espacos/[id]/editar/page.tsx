import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { esquemaIdEspaco } from "@/lib/validacaoEspaco";
import { FormularioEspaco } from "@/components/formularioEspaco";
import { ExcluirEspaco } from "@/components/excluirEspaco";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Editar espaço",
  robots: { index: false, follow: false },
};
export default async function EditarEspaco({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await exigirSessao();
  const { id } = await params;
  if (!esquemaIdEspaco.safeParse(id).success) notFound();
  const espaco = await obterPrisma().space.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!espaco) notFound();
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <Link href="/meus-espacos" className="voltar">
        ← Meus espaços
      </Link>
      <div className="cabecalhoGerenciamento">
        <div>
          <p className="sobretitulo">GERENCIAR ESPAÇO</p>
          <h1>Editar {espaco.name}</h1>
          <p>Mantenha as informações do catálogo atualizadas.</p>
        </div>
      </div>
      <FormularioEspaco
        espaco={{
          id: espaco.id,
          name: espaco.name,
          description: espaco.description,
          capacity: String(espaco.capacity),
          pricePerHour: espaco.pricePerHour.toFixed(2).replace(".", ","),
          pricePeakHour: espaco.pricePeakHour.toFixed(2).replace(".", ","),
          location: espaco.location,
          amenities: espaco.amenities.join("\n"),
          imageUrl: espaco.imageUrl,
        }}
      />
      <Link
        href={`/reservas-recebidas?espaco=${espaco.id}`}
        className="botao botaoNeutro"
      >
        Ver reservas deste espaço
      </Link>
      <ExcluirEspaco id={espaco.id} nome={espaco.name} />
    </main>
  );
}
