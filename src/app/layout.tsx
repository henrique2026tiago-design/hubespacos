import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import { Cabecalho, Rodape } from "@/components/estrutura";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HubEspaços — encontre seu próximo espaço",
    template: "%s | HubEspaços",
  },
  description:
    "Conheça quadras e espaços de eventos. Compare fotos, comodidades, capacidade e valores por hora.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="pularConteudo">
          Pular para o conteúdo
        </a>
        <Cabecalho />
        {children}
        <Rodape />
      </body>
    </html>
  );
}
