import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { esquemaIdEspaco } from "@/lib/validacaoEspaco";
import { ListaReservas } from "@/components/listaReservas";
import { obterAgora } from "@/lib/relogioServidor";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Reservas recebidas",
  robots: { index: false, follow: false },
};
export default async function ReservasRecebidas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await exigirSessao();
  const agora = await obterAgora();
  const { espaco } = await searchParams;
  const prisma = obterPrisma();
  let nomeEspaco: string | undefined;
  if (espaco !== undefined) {
    if (
      typeof espaco !== "string" ||
      !esquemaIdEspaco.safeParse(espaco).success
    )
      notFound();
    const proprio = await prisma.space.findFirst({
      where: { id: espaco, ownerId: user.id },
      select: { name: true },
    });
    if (!proprio) notFound();
    nomeEspaco = proprio.name;
  }
  const registros = await prisma.reservation.findMany({
    where: {
      space: { ownerId: user.id },
      ...(typeof espaco === "string" ? { spaceId: espaco } : {}),
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }, { id: "asc" }],
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      totalPrice: true,
      status: true,
      spaceId: true,
      space: { select: { name: true } },
      user: { select: { name: true } },
    },
  });
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <Link href="/meus-espacos" className="voltar">
        ← Meus espaços
      </Link>
      <div className="cabecalhoGerenciamento">
        <div>
          <p className="sobretitulo">AGENDA DOS SEUS ESPAÇOS</p>
          <h1>Reservas recebidas</h1>
          <p>
            {nomeEspaco ??
              "Reservas vinculadas somente aos espaços que você criou."}
          </p>
        </div>
      </div>
      {registros.length ? (
        <ListaReservas
          agora={agora}
          recebidas
          reservas={registros.map((r) => ({
            id: r.id,
            data: r.date.toISOString().slice(0, 10),
            inicio: r.startTime.getUTCHours(),
            fim: r.endTime.getUTCHours(),
            valor: r.totalPrice.toFixed(2),
            status: r.status,
            spaceId: r.spaceId,
            nomeEspaco: r.space.name,
            cliente: r.user.name,
          }))}
        />
      ) : (
        <section className="vazioMeusEspacos">
          <h2>Nenhuma reserva recebida.</h2>
          <p>As reservas feitas nos seus espaços aparecerão aqui.</p>
        </section>
      )}
    </main>
  );
}
