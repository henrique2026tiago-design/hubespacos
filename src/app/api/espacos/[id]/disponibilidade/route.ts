import { obterPrisma } from "@/lib/prisma";
import { esquemaDataAgenda } from "@/lib/validacaoReserva";
import { esquemaIdEspaco } from "@/lib/validacaoEspaco";
import {
  ABERTURA,
  FECHAMENTO,
  emPico,
  instanteAgenda,
  limiteDatas,
} from "@/lib/agenda";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = esquemaDataAgenda.safeParse(
    new URL(request.url).searchParams.get("data"),
  );
  const limites = limiteDatas();
  if (
    !esquemaIdEspaco.safeParse(id).success ||
    !data.success ||
    data.data < limites.minimo ||
    data.data > limites.maximo
  ) {
    return Response.json(
      { mensagem: "Selecione uma data entre hoje e os próximos 90 dias." },
      { status: 400, headers },
    );
  }
  try {
    const prisma = obterPrisma();
    const espaco = await prisma.space.findUnique({
      where: { id },
      select: { pricePerHour: true, pricePeakHour: true },
    });
    if (!espaco)
      return Response.json(
        { mensagem: "Espaço não encontrado." },
        { status: 404, headers },
      );
    const reservas = await prisma.reservation.findMany({
      where: {
        spaceId: id,
        date: new Date(`${data.data}T00:00:00Z`),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startTime: true, endTime: true },
    });
    const horarios = Array.from(
      { length: FECHAMENTO - ABERTURA },
      (_, indice) => {
        const inicio = ABERTURA + indice;
        const passado =
          instanteAgenda(data.data, inicio).getTime() <= Date.now();
        const ocupado = reservas.some(
          (r) =>
            r.startTime.getUTCHours() * 60 + r.startTime.getUTCMinutes() <
              (inicio + 1) * 60 &&
            r.endTime.getUTCHours() * 60 + r.endTime.getUTCMinutes() >
              inicio * 60,
        );
        return {
          inicio,
          disponivel: !passado && !ocupado,
          pico: emPico(inicio),
          passado,
        };
      },
    );
    // Somente disponibilidade e tarifas; nenhuma identidade de cliente é pública.
    return Response.json(
      {
        data: data.data,
        precoNormal: espaco.pricePerHour.toFixed(2),
        precoPico: espaco.pricePeakHour.toFixed(2),
        horarios,
      },
      { headers },
    );
  } catch {
    return Response.json(
      { mensagem: "Não foi possível atualizar a agenda. Tente novamente." },
      { status: 503, headers },
    );
  }
}
