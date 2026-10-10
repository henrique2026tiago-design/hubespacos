import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { obterPrisma } from "./prisma";
export const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;
export class ErroFoto extends Error {}

export async function prepararFoto(
  arquivo: FormDataEntryValue | null,
  obrigatoria: boolean,
) {
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    if (obrigatoria) throw new ErroFoto("Selecione uma fotografia do espaço.");
    return null;
  }
  if (arquivo.size > TAMANHO_MAXIMO_FOTO)
    throw new ErroFoto("A foto deve ter no máximo 2 MB.");
  const formatos: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!formatos[arquivo.type])
    throw new ErroFoto("Envie uma fotografia JPG, PNG ou WebP.");
  try {
    const bytes = Buffer.from(await arquivo.arrayBuffer());
    const imagem = sharp(bytes, {
      limitInputPixels: 40_000_000,
      // Aceita avisos recuperáveis; falhas de decodificação continuam bloqueadas.
      failOn: "error",
    });
    const info = await imagem.metadata();
    if (
      info.format !== formatos[arquivo.type] ||
      !info.width ||
      !info.height ||
      (info.pages ?? 1) > 1
    ) {
      throw new ErroFoto(
        "O conteúdo não corresponde a uma fotografia válida. Use JPG, PNG ou WebP sem animação.",
      );
    }
    // Decodifica de fato, remove metadados e gera um JPEG seguro e otimizado.
    return await imagem
      .rotate()
      .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (erro) {
    if (erro instanceof ErroFoto) throw erro;
    // Registra só o diagnóstico do decodificador, sem o arquivo ou credenciais.
    console.error(
      "Falha na decodificação da foto:",
      erro instanceof Error ? erro.message.slice(0, 300) : "Erro desconhecido",
    );
    throw new ErroFoto(
      "Não foi possível ler essa foto. Selecione outro arquivo JPG, PNG ou WebP.",
    );
  }
}
export async function enviarFoto(bytes: Buffer, ownerId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error("Armazenamento não configurado.");
  const foto = await put(
    `hubespacos/espacos/${encodeURIComponent(ownerId)}/${randomUUID()}.jpg`,
    bytes,
    {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
      abortSignal: AbortSignal.timeout(20_000),
    },
  );
  return foto.url;
}
// Nunca aceita uma URL vinda do formulário. Só remove fotos próprias, sem referência no banco.
export async function removerFotoSemUso(url: string, ownerId: string) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const storeId = token?.split("_")[3];
    const endereco = new URL(url);
    if (
      !storeId ||
      endereco.protocol !== "https:" ||
      endereco.hostname !==
        `${storeId.toLowerCase()}.public.blob.vercel-storage.com` ||
      !endereco.pathname.startsWith(
        `/hubespacos/espacos/${encodeURIComponent(ownerId)}/`,
      )
    )
      return;
    if (await obterPrisma().space.count({ where: { imageUrl: url } })) return;
    await del(url, { abortSignal: AbortSignal.timeout(8_000) });
  } catch {
    // O cadastro já foi concluído. Uma falha na limpeza não desfaz os dados salvos.
    console.error("Não foi possível limpar uma foto sem uso no armazenamento.");
  }
}
