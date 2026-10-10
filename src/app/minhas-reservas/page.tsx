import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { ListaReservas } from "@/components/listaReservas";
import { obterAgora } from "@/lib/relogioServidor";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Minhas reservas",
  robots: { index: false, follow: false },
};
export default async function MinhasReservas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await exigirSessao();
  const agora = await obterAgora();
  const { resultado } = await searchParams;
  const registros = await obterPrisma().reservation.findMany({
    where: { userId: user.id },
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
    },
  });
  return (
    <main id="conteudo" className="container paginaGerenciamento">
      <Link href="/conta" className="voltar">
        ← Minha conta
      </Link>
      <div className="cabecalhoGerenciamento">
        <div>
          <p className="sobretitulo">SEUS ENCONTROS MARCADOS</p>
          <h1>Minhas reservas</h1>
          <p>Confira seus horários e o histórico de reservas.</p>
        </div>
        <Link href="/#catalogo" className="botao botaoVerde">
          Encontrar um espaço
        </Link>
      </div>
      {(resultado === "criada" || resultado === "cancelada") && (
        <p className="sucessoEspaco" role="status">
          {resultado === "criada"
            ? "Reserva confirmada com sucesso."
            : "Reserva cancelada. O horário foi liberado."}
        </p>
      )}
      {registros.length ? (
        <ListaReservas
          agora={agora}
          reservas={registros.map((r) => ({
            id: r.id,
            data: r.date.toISOString().slice(0, 10),
            inicio: r.startTime.getUTCHours(),
            fim: r.endTime.getUTCHours(),
            valor: r.totalPrice.toFixed(2),
            status: r.status,
            spaceId: r.spaceId,
            nomeEspaco: r.space.name,
          }))}
        />
      ) : (
        <section className="vazioMeusEspacos">
          <h2>Você ainda não tem reservas.</h2>
          <p>
            Escolha um espaço no catálogo e confira os horários disponíveis.
          </p>
          <Link href="/#catalogo" className="botao botaoVerde">
            Explorar espaços
          </Link>
        </section>
      )}
    </main>
  );
}
