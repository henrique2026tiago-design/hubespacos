import "server-only";
import { z } from "zod";
import { ABERTURA, FECHAMENTO, instanteAgenda, limiteDatas } from "./agenda";
import { esquemaIdEspaco } from "./validacaoEspaco";
export const esquemaDataAgenda = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma data válida.")
  .refine((data) => {
    const dia = new Date(`${data}T00:00:00Z`);
    return (
      Number.isFinite(dia.getTime()) && dia.toISOString().slice(0, 10) === data
    );
  }, "Selecione uma data válida.");
const hora = z
  .string()
  .regex(/^\d{2}:00$/, "Escolha horários com horas inteiras.")
  .transform((valor) => Number(valor.slice(0, 2)))
  .pipe(z.number().int().min(ABERTURA).max(FECHAMENTO));
export const esquemaReserva = z
  .object({
    spaceId: esquemaIdEspaco,
    date: esquemaDataAgenda,
    startTime: hora,
    endTime: hora,
    precoExibido: z
      .string()
      .regex(/^\d{1,8}\.\d{2}$/, "Atualize a agenda antes de confirmar."),
    confirmacao: z.literal("aceito", {
      errorMap: () => ({ message: "Leia e aceite as condições da reserva." }),
    }),
  })
  .superRefine((dados, ctx) => {
    if (dados.endTime <= dados.startTime)
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "O fim deve ser depois do início, no mesmo dia.",
      });
    const limites = limiteDatas();
    if (dados.date < limites.minimo || dados.date > limites.maximo)
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Reserve entre hoje e os próximos 90 dias.",
      });
    // Um campo de data malformado não pode chegar à conversão de fuso.
    if (
      esquemaDataAgenda.safeParse(dados.date).success &&
      Number.isFinite(dados.startTime) &&
      instanteAgenda(dados.date, dados.startTime).getTime() <= Date.now()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Esse horário já passou. Escolha um horário futuro.",
      });
    }
  });
