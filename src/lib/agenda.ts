// Regras compartilhadas para exibição. O servidor sempre recalcula preço e validade.
export const FUSO_AGENDA = "America/Sao_Paulo";
export const ABERTURA = 8;
export const FECHAMENTO = 23;
export const INICIO_PICO = 18;
export const FIM_PICO = 22;
export type EstadoReserva = { mensagem?: string };
export type Disponibilidade = {
  data: string;
  precoNormal: string;
  precoPico: string;
  horarios: {
    inicio: number;
    disponivel: boolean;
    pico: boolean;
    passado: boolean;
  }[];
};
export function partesLocais(instante = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_AGENDA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const ler = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)!.value;
  return {
    data: `${ler("year")}-${ler("month")}-${ler("day")}`,
    hora: Number(ler("hour")),
    minuto: Number(ler("minute")),
    segundo: Number(ler("second")),
  };
}
export function limiteDatas(agora = new Date()) {
  const hoje = partesLocais(agora).data;
  const limite = new Date(`${hoje}T00:00:00Z`);
  limite.setUTCDate(limite.getUTCDate() + 90);
  return { minimo: hoje, maximo: limite.toISOString().slice(0, 10) };
}
export function horaTexto(hora: number) {
  return `${String(hora).padStart(2, "0")}:00`;
}
export function emPico(hora: number) {
  return hora >= INICIO_PICO && hora < FIM_PICO;
}
export function calcularValor(
  inicio: number,
  fim: number,
  normal: string,
  pico: string,
) {
  const emCentavos = (valor: string) => {
    const [inteiro, decimal = ""] = valor.split(".");
    return BigInt(inteiro) * BigInt(100) + BigInt(decimal.padEnd(2, "0"));
  };
  let total = BigInt(0);
  for (let h = inicio; h < fim; h++)
    total += emCentavos(emPico(h) ? pico : normal);
  return `${total / BigInt(100)}.${String(total % BigInt(100)).padStart(2, "0")}`;
}
export function moedaAgenda(valor: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}
export function dataAgenda(data: string) {
  return data.split("-").reverse().join("/");
}
// Converte a data civil do agendamento pelo fuso IANA, sem depender do fuso do servidor.
export function instanteAgenda(data: string, hora: number) {
  const alvo = new Date(`${data}T${horaTexto(hora)}:00Z`).getTime();
  let candidato = alvo;
  for (let i = 0; i < 3; i++) {
    const partes = partesLocais(new Date(candidato));
    const localComoUTC = new Date(
      `${partes.data}T${String(partes.hora).padStart(2, "0")}:${String(partes.minuto).padStart(2, "0")}:${String(partes.segundo).padStart(2, "0")}Z`,
    ).getTime();
    candidato += alvo - localComoUTC;
  }
  return new Date(candidato);
}
