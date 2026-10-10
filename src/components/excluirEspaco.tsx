"use client";
import { useActionState, useState } from "react";
import { excluirEspaco } from "@/app/espacos/actions";
import type { EstadoEspaco } from "@/lib/tiposEspaco";
const inicial: EstadoEspaco = {};
export function ExcluirEspaco({ id, nome }: { id: string; nome: string }) {
  const [aberto, definirAberto] = useState(false);
  const [estado, enviar, pendente] = useActionState(
    excluirEspaco.bind(null, id),
    inicial,
  );
  return (
    <section className="exclusaoEspaco" aria-labelledby="tituloExclusao">
      <h2 id="tituloExclusao">Excluir este espaço</h2>
      <p>
        A exclusão é definitiva. Espaços com reservas vinculadas não podem ser
        excluídos.
      </p>
      {!aberto ? (
        <button
          type="button"
          className="botao botaoPerigo"
          onClick={() => definirAberto(true)}
        >
          Excluir espaço
        </button>
      ) : (
        <form action={enviar} className="confirmacaoExclusao">
          <p>
            Excluir <strong>{nome}</strong> do catálogo?
          </p>
          <label>
            <input
              type="checkbox"
              name="confirmacao"
              value="excluir"
              required
              disabled={pendente}
            />{" "}
            Entendo que esta ação não pode ser desfeita.
          </label>
          {estado.mensagem && (
            <p className="alertaEspaco" role="alert">
              {estado.mensagem}
            </p>
          )}
          <div className="acoesExclusao">
            <button
              type="button"
              className="botao botaoNeutro"
              disabled={pendente}
              onClick={() => definirAberto(false)}
            >
              Manter espaço
            </button>
            <button
              type="submit"
              className="botao botaoPerigo"
              disabled={pendente}
            >
              {pendente ? "Excluindo…" : "Confirmar exclusão"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
