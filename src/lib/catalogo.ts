import "server-only";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { obterPrisma } from "./prisma";

const esquemaFiltros = z.object({
  busca: z
    .string()
    .trim()
    .max(120, "Use até 120 caracteres na busca.")
    .default(""),
  ordem: z.enum(["nome", "menorPreco", "maiorCapacidade"]).default("nome"),
});
export type FiltrosCatalogo = z.infer<typeof esquemaFiltros>;
export type ParametrosBusca = Record<string, string | string[] | undefined>;
export function validarFiltros(parametros: ParametrosBusca) {
  const primeiro = (valor: string | string[] | undefined) =>
    Array.isArray(valor) ? valor[0] : valor;
  return esquemaFiltros.safeParse({
    busca: primeiro(parametros.busca),
    ordem: primeiro(parametros.ordem),
  });
}
const camposPublicos = {
  id: true,
  name: true,
  description: true,
  capacity: true,
  pricePerHour: true,
  pricePeakHour: true,
  location: true,
  amenities: true,
  imageUrl: true,
} satisfies Prisma.SpaceSelect;

export async function consultarCatalogo(filtros: FiltrosCatalogo) {
  const where: Prisma.SpaceWhereInput = filtros.busca
    ? {
        OR: [
          { name: { contains: filtros.busca, mode: "insensitive" } },
          { description: { contains: filtros.busca, mode: "insensitive" } },
          { location: { contains: filtros.busca, mode: "insensitive" } },
        ],
      }
    : {};
  const orderBy: Prisma.SpaceOrderByWithRelationInput[] =
    filtros.ordem === "menorPreco"
      ? [{ pricePerHour: "asc" }, { name: "asc" }, { id: "asc" }]
      : filtros.ordem === "maiorCapacidade"
        ? [{ capacity: "desc" }, { name: "asc" }, { id: "asc" }]
        : [{ name: "asc" }, { id: "asc" }];
  // Filtragem e ordenação no PostgreSQL; nenhum dado de autenticação é exposto.
  return obterPrisma().space.findMany({
    where,
    orderBy,
    select: camposPublicos,
  });
}
export async function consultarResumo() {
  const prisma = obterPrisma();
  const [total, destaque] = await Promise.all([
    prisma.space.count(),
    prisma.space.findFirst({
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { name: true, imageUrl: true, location: true },
    }),
  ]);
  return { total, destaque };
}
export async function consultarEspaco(id: string) {
  return obterPrisma().space.findUnique({
    where: { id },
    select: camposPublicos,
  });
}
export function formatarPreco(valor: Prisma.Decimal | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor.toString()));
}
export function identificarCategoria(nome: string) {
  const texto = nome.toLocaleLowerCase("pt-BR");
  if (/society|quadra|tênis|tenis|areia/.test(texto)) return "Esporte";
  if (/auditório|auditorio/.test(texto)) return "Encontros";
  if (/estúdio|estudio/.test(texto)) return "Movimento";
  return "Eventos";
}
