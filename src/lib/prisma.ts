import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const contextoGlobal = globalThis as unknown as {
  prismaHubEspacos?: PrismaClient;
};

// A conexão só é aberta em consultas, sem acessar o banco durante o build.
export function obterPrisma() {
  if (!contextoGlobal.prismaHubEspacos) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error("Conexão com o banco não configurada.");
    contextoGlobal.prismaHubEspacos = new PrismaClient({
      adapter: new PrismaPg({
        connectionString,
        max: 5,
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 30_000,
      }),
      log: ["error"],
    });
  }
  return contextoGlobal.prismaHubEspacos;
}
