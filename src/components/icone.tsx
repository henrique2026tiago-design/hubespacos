import type { SVGProps } from "react";
const caminhos = {
  seta: "M5 12h14m-6-6 6 6-6 6",
  busca: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  local:
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  pessoas:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  check: "m5 12 4 4L19 6",
  relogio: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  quadra: "M3 4h18v16H3ZM12 4v16M3 12h18M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  foto: "M3 5h18v14H3ZM3 16l5-5 5 5 3-3 5 5M17 8h.01",
  voltar: "M19 12H5m6-6-6 6 6 6",
};
export function Icone({
  nome,
  ...props
}: SVGProps<SVGSVGElement> & { nome: keyof typeof caminhos }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={caminhos[nome]} />
    </svg>
  );
}
