"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { esquemaReserva } from "@/lib/validacaoReserva";
import { esquemaIdEspaco } from "@/lib/validacaoEspaco";
import {
  calcularValor,
  horaTexto,
  instanteAgenda,
  type EstadoReserva,
} from "@/lib/agenda";
class ErroReserva extends Error {}
function invalidar(spaceId: string) {
  revalidatePath(`/espacos/${spaceId}`);
  revalidatePath("/minhas-reservas");
  revalidatePath("/reservas-recebidas");
}
function falha(erro: unknown): EstadoReserva {
  if (erro instanceof ErroReserva) return { mensagem: erro.message };
  if (
    erro instanceof Error &&
    /23P01|Reservation_no_overlap|exclusion constraint/i.test(erro.message)
  ) {
    return {
      mensagem:
        "Esse intervalo acabou de ser reservado. Atualize a agenda e escolha outro horário.",
    };
  }
  console.error("Falha em uma operação de reserva.");
  return {
    mensagem:
      "Não foi possível concluir a reserva. Atualize a agenda e tente novamente.",
  };
}
export async function criarReserva(
  _anterior: EstadoReserva,
  formulario: FormData,
): Promise<EstadoReserva> {
  const { user } = await exigirSessao();
  const entrada = esquemaReserva.safeParse({
    spaceId: formulario.get("spaceId"),
    date: formulario.get("date"),
    startTime: formulario.get("startTime"),
    endTime: formulario.get("endTime"),
    precoExibido: formulario.get("precoExibido"),
    confirmacao: formulario.get("confirmacao"),
  });
  if (!entrada.success) return { mensagem: entrada.error.issues[0].message };
  const dados = entrada.data;
  try {
    await obterPrisma().$transaction(
      async (tx) => {
        // Lock por espaço serializa a conferência e a inserção, inclusive entre instâncias.
        const existente = await tx.$queryRaw<
          { id: string }[]
        >`SELECT id FROM "Space" WHERE id = ${dados.spaceId} FOR UPDATE`;
        if (!existente.length)
          throw new ErroReserva("Esse espaço não está mais disponível.");
        const espaco = await tx.space.findUniqueOrThrow({
          where: { id: dados.spaceId },
          select: { pricePerHour: true, pricePeakHour: true },
        });
        if (instanteAgenda(dados.date, dados.startTime).getTime() <= Date.now())
          throw new ErroReserva("Esse horário já passou. Atualize a agenda.");
        const date = new Date(`${dados.date}T00:00:00Z`);
        const startTime = new Date(
          `1970-01-01T${horaTexto(dados.startTime)}:00Z`,
        );
        const endTime = new Date(`1970-01-01T${horaTexto(dados.endTime)}:00Z`);
        const conflito = await tx.reservation.findFirst({
          where: {
            spaceId: dados.spaceId,
            date,
            status: { in: ["PENDING", "CONFIRMED"] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });
        if (conflito)
          throw new ErroReserva(
            "Esse intervalo acabou de ser reservado. Atualize a agenda e escolha outro horário.",
          );
        const totalPrice = calcularValor(
          dados.startTime,
          dados.endTime,
          espaco.pricePerHour.toFixed(2),
          espaco.pricePeakHour.toFixed(2),
        );
        if (totalPrice !== dados.precoExibido)
          throw new ErroReserva(
            "Os valores foram atualizados. Atualize a agenda e confira o total antes de confirmar.",
          );
        await tx.reservation.create({
          data: {
            spaceId: dados.spaceId,
            userId: user.id,
            date,
            startTime,
            endTime,
            totalPrice,
            status: "CONFIRMED",
          },
        });
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  } catch (erro) {
    return falha(erro);
  }
  invalidar(dados.spaceId);
  redirect("/minhas-reservas?resultado=criada");
}
export async function cancelarReserva(
  id: string,
  _anterior: EstadoReserva,
  formulario: FormData,
): Promise<EstadoReserva> {
  const { user } = await exigirSessao();
  if (!esquemaIdEspaco.safeParse(id).success)
    return { mensagem: "Reserva inválida." };
  if (formulario.get("confirmacao") !== "cancelar")
    return { mensagem: "Confirme o cancelamento para continuar." };
  let spaceId: string;
  try {
    spaceId = await obterPrisma().$transaction(
      async (tx) => {
        const reserva = await tx.reservation.findFirst({
          where: { id, userId: user.id },
        });
        if (!reserva)
          throw new ErroReserva(
            "Reserva não encontrada ou você não tem permissão para cancelá-la.",
          );
        await tx.$queryRaw`SELECT id FROM "Space" WHERE id = ${reserva.spaceId} FOR UPDATE`;
        const atual = await tx.reservation.findFirst({
          where: {
            id,
            userId: user.id,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });
        if (!atual) throw new ErroReserva("Essa reserva já foi cancelada.");
        const inicio = instanteAgenda(
          atual.date.toISOString().slice(0, 10),
          atual.startTime.getUTCHours(),
        );
        if (inicio.getTime() - Date.now() < 24 * 60 * 60 * 1000)
          throw new ErroReserva(
            "O cancelamento gratuito pelo sistema exige pelo menos 24 horas de antecedência. Após esse prazo, acerte as condições diretamente com o responsável pelo espaço.",
          );
        await tx.reservation.updateMany({
          where: {
            id,
            userId: user.id,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          data: { status: "CANCELLED" },
        });
        return atual.spaceId;
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  } catch (erro) {
    return falha(erro);
  }
  invalidar(spaceId);
  redirect("/minhas-reservas?resultado=cancelada");
}
