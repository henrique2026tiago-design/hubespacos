import "server-only";
import { connection } from "next/server";
// Snapshot por requisição para as telas de histórico; o prazo é rechecado na ação.
export async function obterAgora() {
  await connection();
  return Date.now();
}
