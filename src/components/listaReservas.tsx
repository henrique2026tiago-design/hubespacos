import Link from "next/link";
import type { ReservationStatus } from "@/generated/prisma/client";
import {
  dataAgenda,
  horaTexto,
  instanteAgenda,
  moedaAgenda,
} from "@/lib/agenda";
import { CancelarReserva } from "./cancelarReserva";
export type ReservaLista = {
  id: string;
  data: string;
  inicio: number;
  fim: number;
  valor: string;
  status: ReservationStatus;
  spaceId: string;
  nomeEspaco: string;
  cliente?: string;
};
const status = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};
export function ListaReservas({
  reservas,
  recebidas = false,
  agora,
}: {
  reservas: ReservaLista[];
  recebidas?: boolean;
  agora: number;
}) {
  return (
    <div className="listaReservas">
      {reservas.map((r) => {
        const antecedencia = instanteAgenda(r.data, r.inicio).getTime() - agora;
        return (
          <article className="cartaoReserva" key={r.id}>
            <div className="tituloCartaoReserva">
              <div>
                <p className="sobretitulo">
                  {dataAgenda(r.data)} · {horaTexto(r.inicio)}–
                  {horaTexto(r.fim)}
                </p>
                <h2>
                  <Link href={`/espacos/${r.spaceId}`}>{r.nomeEspaco}</Link>
                </h2>
              </div>
              <span className={`statusReserva status${r.status}`}>
                {status[r.status]}
              </span>
            </div>
            {recebidas && (
              <p className="clienteReserva">
                Reservado por <strong>{r.cliente}</strong>
              </p>
            )}
            <div className="rodapeCartaoReserva">
              <p>
                Valor da reserva <strong>{moedaAgenda(r.valor)}</strong>
              </p>
              <Link
                href={`/espacos/${r.spaceId}`}
                className="linkEspacoReserva"
              >
                Ver espaço ↗
              </Link>
            </div>
            {!recebidas &&
              r.status !== "CANCELLED" &&
              (antecedencia >= 24 * 60 * 60 * 1000 ? (
                <CancelarReserva id={r.id} />
              ) : (
                <p className="notaPrazoReserva">
                  {antecedencia <= 0
                    ? "O horário desta reserva já passou."
                    : "O prazo de cancelamento gratuito pelo sistema terminou. Consulte as condições do espaço."}
                </p>
              ))}
          </article>
        );
      })}
    </div>
  );
}
