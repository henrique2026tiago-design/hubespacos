"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { exigirSessao } from "@/lib/sessao";
import { obterPrisma } from "@/lib/prisma";
import { esquemaEspaco, esquemaIdEspaco } from "@/lib/validacaoEspaco";
import {
  ErroFoto,
  prepararFoto,
  enviarFoto,
  removerFotoSemUso,
} from "@/lib/fotoEspaco";
import type { EstadoEspaco } from "@/lib/tiposEspaco";

function lerCampos(formulario: FormData) {
  return esquemaEspaco.safeParse({
    name: formulario.get("name"),
    description: formulario.get("description"),
    capacity: formulario.get("capacity"),
    pricePerHour: formulario.get("pricePerHour"),
    pricePeakHour: formulario.get("pricePeakHour"),
    location: formulario.get("location"),
    amenities: formulario.get("amenities"),
  });
}
function atualizarPaginas(id: string) {
  revalidatePath("/");
  revalidatePath("/meus-espacos");
  revalidatePath(`/espacos/${id}`);
  revalidatePath(`/espacos/${id}/editar`);
}
function falha(erro: unknown): EstadoEspaco {
  if (erro instanceof ErroFoto)
    return {
      mensagem: "Confira a fotografia.",
      erros: { foto: [erro.message] },
    };
  if (
    erro instanceof Prisma.PrismaClientKnownRequestError &&
    erro.code === "P2003"
  ) {
    return {
      mensagem:
        "Este espaço possui reservas vinculadas e não pode ser excluído. O histórico de reservas deve ser preservado.",
    };
  }
  console.error("Falha ao salvar uma alteração de espaço.");
  return {
    mensagem:
      "Não foi possível concluir a alteração. Tente novamente. Se estiver enviando uma foto, confira a configuração do Blob.",
  };
}
export async function criarEspaco(
  _anterior: EstadoEspaco,
  formulario: FormData,
): Promise<EstadoEspaco> {
  const { user } = await exigirSessao();
  const campos = lerCampos(formulario);
  if (!campos.success)
    return {
      mensagem: "Confira os campos destacados.",
      erros: campos.error.flatten().fieldErrors,
    };
  let fotoNova: string | undefined;
  let id: string;
  try {
    const bytes = await prepararFoto(formulario.get("foto"), true);
    fotoNova = await enviarFoto(bytes!, user.id);
    const espaco = await obterPrisma().space.create({
      data: { ...campos.data, imageUrl: fotoNova, ownerId: user.id },
    });
    id = espaco.id;
  } catch (erro) {
    if (fotoNova) await removerFotoSemUso(fotoNova, user.id);
    return falha(erro);
  }
  atualizarPaginas(id);
  redirect(`/meus-espacos?resultado=criado`);
}
export async function editarEspaco(
  id: string,
  _anterior: EstadoEspaco,
  formulario: FormData,
): Promise<EstadoEspaco> {
  const { user } = await exigirSessao();
  if (!esquemaIdEspaco.safeParse(id).success)
    return { mensagem: "Espaço inválido." };
  let fotoNova: string | undefined;
  let fotoAnterior: string | undefined;
  try {
    // A sessão define o proprietário; IDs fornecidos pelo cliente nunca definem autorização.
    const atual = await obterPrisma().space.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!atual)
      return {
        mensagem:
          "Espaço não encontrado ou você não tem permissão para editá-lo.",
      };
    const campos = lerCampos(formulario);
    if (!campos.success)
      return {
        mensagem: "Confira os campos destacados.",
        erros: campos.error.flatten().fieldErrors,
      };
    const bytes = await prepararFoto(formulario.get("foto"), false);
    if (bytes) fotoNova = await enviarFoto(bytes, user.id);
    const alteracao = await obterPrisma().space.updateMany({
      where: { id, ownerId: user.id, updatedAt: atual.updatedAt },
      data: { ...campos.data, ...(fotoNova ? { imageUrl: fotoNova } : {}) },
    });
    if (!alteracao.count) {
      if (fotoNova) await removerFotoSemUso(fotoNova, user.id);
      return {
        mensagem:
          "O espaço foi alterado em outra requisição. Recarregue a página antes de tentar novamente.",
      };
    }
    if (fotoNova) fotoAnterior = atual.imageUrl;
  } catch (erro) {
    if (fotoNova) await removerFotoSemUso(fotoNova, user.id);
    return falha(erro);
  }
  if (fotoAnterior) await removerFotoSemUso(fotoAnterior, user.id);
  atualizarPaginas(id);
  redirect(`/meus-espacos?resultado=editado`);
}
export async function excluirEspaco(
  id: string,
  _anterior: EstadoEspaco,
  formulario: FormData,
): Promise<EstadoEspaco> {
  const { user } = await exigirSessao();
  if (!esquemaIdEspaco.safeParse(id).success)
    return { mensagem: "Espaço inválido." };
  if (formulario.get("confirmacao") !== "excluir")
    return { mensagem: "Confirme a exclusão para continuar." };
  let foto: string;
  try {
    const atual = await obterPrisma().space.findFirst({
      where: { id, ownerId: user.id },
      select: { imageUrl: true, updatedAt: true },
    });
    if (!atual)
      return {
        mensagem:
          "Espaço não encontrado ou você não tem permissão para excluí-lo.",
      };
    // O filtro de proprietário é repetido na mutação; a FK impede apagar reservas.
    const resultado = await obterPrisma().space.deleteMany({
      where: { id, ownerId: user.id, updatedAt: atual.updatedAt },
    });
    if (!resultado.count)
      return {
        mensagem: "O espaço mudou. Recarregue a página antes de excluir.",
      };
    foto = atual.imageUrl;
  } catch (erro) {
    return falha(erro);
  }
  await removerFotoSemUso(foto, user.id);
  atualizarPaginas(id);
  redirect("/meus-espacos?resultado=excluido");
}
