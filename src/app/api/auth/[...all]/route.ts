import { toNextJsHandler } from "better-auth/next-js";
import { obterAuth } from "@/lib/auth";
export const runtime = "nodejs";

const handlers = toNextJsHandler(async (request: Request) => {
  try {
    return await obterAuth().handler(request);
  } catch {
    // Não devolve strings de conexão, segredos nem detalhes internos.
    return Response.json(
      {
        code: "SERVICE_UNAVAILABLE",
        message: "A autenticação está temporariamente indisponível.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
});
export const GET = handlers.GET;
export const POST = handlers.POST;
