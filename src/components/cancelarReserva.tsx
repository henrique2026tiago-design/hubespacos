"use client";
import { useActionState, useState } from "react";
import { cancelarReserva } from "@/app/reservas/actions";
import type { EstadoReserva } from "@/lib/agenda";
const inicial: EstadoReserva = {};
export function CancelarReserva({ id }: { id: string }) {
  const [aberto, definirAberto] = useState(false);
  const [estado, enviar, pendente] = useActionState(
    cancelarReserva.bind(null, id),
    inicial,
  );
  return !aberto ? (
    <button
      type="button"
      className="botao botaoNeutro"
      onClick={() => definirAberto(true)}
    >
      Cancelar reserva
    </button>
  ) : (
    <form action={enviar} className="formularioCancelamento">
      <label>
        <input
          type="checkbox"
          name="confirmacao"
          value="cancelar"
          required
          disabled={pendente}
        />{" "}
        Confirmo o cancelamento gratuito desta reserva.
      </label>
      {estado.mensagem && (
        <p className="alertaEspaco" role="alert">
          {estado.mensagem}
        </p>
      )}
      <div className="acoesExclusao">
        <button
          className="botao botaoNeutro"
          type="button"
          disabled={pendente}
          onClick={() => definirAberto(false)}
        >
          Manter reserva
        </button>
        <button className="botao botaoPerigo" type="submit" disabled={pendente}>
          {pendente ? "Cancelando…" : "Confirmar cancelamento"}
        </button>
      </div>
    </form>
  );
}
