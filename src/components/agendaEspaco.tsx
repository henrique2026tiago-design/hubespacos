"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { criarReserva } from "@/app/reservas/actions";
import {
  calcularValor,
  horaTexto,
  limiteDatas,
  moedaAgenda,
  type Disponibilidade,
  type EstadoReserva,
} from "@/lib/agenda";
class ErroAgenda extends Error {}
const inicial: EstadoReserva = {};
export function AgendaEspaco({
  spaceId,
  autenticado,
  dataInicial,
}: {
  spaceId: string;
  autenticado: boolean;
  dataInicial: string;
}) {
  const [data, definirData] = useState(dataInicial);
  const [agenda, definirAgenda] = useState<Disponibilidade | null>(null);
  const [erro, definirErro] = useState("");
  const [atualizacao, definirAtualizacao] = useState(0);
  const [aceite, definirAceite] = useState<string | null>(null);
  const [inicio, definirInicio] = useState<number | null>(null);
  const [fim, definirFim] = useState<number | null>(null);
  const [estado, enviar, pendente] = useActionState(criarReserva, inicial);
  const limites = limiteDatas();
  useEffect(() => {
    const controlador = new AbortController();
    async function atualizar() {
      try {
        const resposta = await fetch(
          `/api/espacos/${encodeURIComponent(spaceId)}/disponibilidade?data=${encodeURIComponent(data)}`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controlador.signal,
              AbortSignal.timeout(10_000),
            ]),
          },
        );
        const resultado = await resposta.json();
        if (controlador.signal.aborted) return;
        if (!resposta.ok)
          throw new ErroAgenda(
            resultado.mensagem || "Não foi possível atualizar a agenda.",
          );
        definirAgenda(resultado);
        definirErro("");
      } catch (falha) {
        if (controlador.signal.aborted) return;
        definirAgenda(null);
        definirErro(
          falha instanceof ErroAgenda
            ? falha.message
            : "Não foi possível atualizar a agenda. Confira sua conexão e tente novamente.",
        );
      }
    }
    void atualizar();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void atualizar();
    }, 15_000);
    const focar = () => {
      void atualizar();
    };
    window.addEventListener("focus", focar);
    return () => {
      controlador.abort();
      clearInterval(timer);
      window.removeEventListener("focus", focar);
    };
  }, [spaceId, data, atualizacao]);
  const finais: number[] = [];
  if (inicio !== null && agenda) {
    for (const horario of agenda.horarios.filter((h) => h.inicio >= inicio)) {
      if (!horario.disponivel) break;
      finais.push(horario.inicio + 1);
    }
  }
  const selecaoValida = inicio !== null && fim !== null && finais.includes(fim);
  const total =
    agenda && selecaoValida
      ? calcularValor(inicio!, fim!, agenda.precoNormal, agenda.precoPico)
      : "0.00";
  return (
    <section className="agendaEspaco" aria-labelledby="tituloAgenda">
      <p className="sobretitulo">SEU PRÓXIMO ENCONTRO</p>
      <h2 id="tituloAgenda">Escolha um horário</h2>
      <p className="introAgenda">Agenda das 08h às 23h · Horário de Brasília</p>
      <label className="rotuloDataAgenda" htmlFor="data-reserva">
        Dia da reserva
      </label>
      <input
        id="data-reserva"
        type="date"
        value={data}
        min={limites.minimo}
        max={limites.maximo}
        disabled={pendente}
        onChange={(evento) => {
          definirAceite(null);
          definirData(evento.target.value);
          definirAgenda(null);
          definirErro("");
          definirInicio(null);
          definirFim(null);
        }}
      />
      <div className="legendaAgenda">
        <span>● Disponível</span>
        <span>● Pico · 18h–22h</span>
        <span>○ Indisponível</span>
      </div>
      <p className="ajudaAgenda">
        Selecione o início na grade e escolha o fim abaixo.
      </p>
      {!agenda && !erro ? (
        <div
          className="gradeAgenda"
          aria-busy="true"
          aria-label="Carregando disponibilidade"
        >
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="skeleton skeletonHorario" />
          ))}
        </div>
      ) : agenda ? (
        <div className="gradeAgenda">
          {agenda.horarios.map((horario) => (
            <button
              key={horario.inicio}
              type="button"
              className={`horarioAgenda ${horario.pico ? "horarioPico" : ""} ${inicio === horario.inicio ? "horarioSelecionado" : ""}`}
              disabled={!horario.disponivel || pendente}
              aria-pressed={inicio === horario.inicio}
              aria-label={`${horaTexto(horario.inicio)} às ${horaTexto(horario.inicio + 1)}. ${horario.disponivel ? "Disponível" : horario.passado ? "Horário passado" : "Reservado"}. ${horario.pico ? "Pico" : "Fora de pico"}. ${moedaAgenda(horario.pico ? agenda.precoPico : agenda.precoNormal)}`}
              onClick={() => {
                definirAceite(null);
                definirInicio(horario.inicio);
                definirFim(horario.inicio + 1);
              }}
            >
              <strong>{horaTexto(horario.inicio)}</strong>
              <span>
                {horario.disponivel
                  ? moedaAgenda(
                      horario.pico ? agenda.precoPico : agenda.precoNormal,
                    )
                  : horario.passado
                    ? "Passou"
                    : "Reservado"}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {erro && (
        <p className="alertaEspaco" role="alert">
          {erro}
        </p>
      )}
      <button
        type="button"
        className="atualizarAgenda"
        disabled={pendente}
        onClick={() => {
          definirAgenda(null);
          definirErro("");
          definirAtualizacao((a) => a + 1);
        }}
      >
        ↻ Atualizar disponibilidade
      </button>
      <form
        action={enviar}
        className="formularioReserva"
        onReset={() => definirAceite(null)}
      >
        <input type="hidden" name="spaceId" value={spaceId} />
        <input type="hidden" name="date" value={data} />
        <input
          type="hidden"
          name="startTime"
          value={inicio === null ? "" : horaTexto(inicio)}
        />
        <input type="hidden" name="precoExibido" value={total} />
        <label htmlFor="fim-reserva">Reservar até</label>
        <select
          id="fim-reserva"
          name="endTime"
          required
          disabled={!finais.length || pendente}
          value={fim !== null && finais.includes(fim) ? horaTexto(fim) : ""}
          onChange={(e) => {
            definirAceite(null);
            definirFim(Number(e.target.value.slice(0, 2)));
          }}
        >
          <option value="">Selecione o início primeiro</option>
          {finais.map((hora) => (
            <option key={hora} value={horaTexto(hora)}>
              {horaTexto(hora)} · {hora - inicio!}{" "}
              {hora - inicio! === 1 ? "hora" : "horas"}
            </option>
          ))}
        </select>
        <div className="totalReserva">
          <span>Total da reserva</span>
          <strong>{selecaoValida ? moedaAgenda(total) : "—"}</strong>
        </div>
        <div className="politicaReserva">
          <strong>Reserve com clareza</strong>
          <p>
            Tarifa de pico das 18h às 22h. O total combina as horas
            selecionadas.
          </p>
          <p>
            Cancelamento gratuito pelo sistema até 24h antes. Após esse prazo, a
            política prevê 50% do valor, a acertar diretamente com o
            responsável. O HubEspaços não processa pagamentos ou cobranças.
          </p>
        </div>
        <label className="aceiteReserva">
          <input
            type="checkbox"
            name="confirmacao"
            value="aceito"
            checked={aceite === total && selecaoValida}
            onChange={(e) => definirAceite(e.target.checked ? total : null)}
            required
            disabled={pendente || !autenticado}
          />{" "}
          Li os horários, valores e condições de cancelamento.
        </label>
        {estado.mensagem && (
          <p className="alertaEspaco" role="alert">
            {estado.mensagem}
          </p>
        )}
        {autenticado ? (
          <button
            type="submit"
            className="botao botaoVerde"
            disabled={pendente || !selecaoValida || !agenda}
          >
            {pendente ? "Confirmando reserva…" : "Confirmar reserva"}
          </button>
        ) : (
          <Link href="/login" className="botao botaoVerde">
            Entrar para reservar
          </Link>
        )}
        <p className="notaAgenda" role="status">
          {pendente
            ? "Conferindo disponibilidade no servidor."
            : "Atualização a cada 15 segundos. A disponibilidade é conferida novamente ao confirmar."}
        </p>
      </form>
    </section>
  );
}
