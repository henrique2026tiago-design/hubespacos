import type { ReactNode } from "react";
import Link from "next/link";
import { consultarResumo } from "@/lib/catalogo";
import { ImagemEspaco } from "./imagemEspaco";
import { Icone } from "./icone";

export async function MolduraAuth({
  cadastro = false,
  children,
}: {
  cadastro?: boolean;
  children: ReactNode;
}) {
  const { destaque } = await consultarResumo();
  return (
    <main id="conteudo" className="container paginaAuth">
      <div className="apresentacaoAuth">
        <p className="sobretitulo">SEUS PLANOS MERECEM UM BOM LUGAR</p>
        <h1>
          {cadastro ? (
            <>
              Crie sua conta.
              <br />
              <span>Comece novos planos.</span>
            </>
          ) : (
            <>
              Bom ter
              <br />
              <span>você por aqui.</span>
            </>
          )}
        </h1>
        <p className="introducaoAuth">
          {cadastro
            ? "Um cadastro simples para entrar no HubEspaços e acessar sua conta."
            : "Entre no HubEspaços e continue explorando lugares para jogar, celebrar e se encontrar."}
        </p>
        <div className="fotoAuth">
          {destaque ? (
            <ImagemEspaco
              src={destaque.imageUrl}
              alt={"Fotografia ilustrativa de " + destaque.name}
              sizes="(max-width: 760px) 100vw, 45vw"
              prioridade
            />
          ) : (
            <div className="fotoIndisponivel">
              <Icone nome="foto" />
              Espaços para seus planos
            </div>
          )}
          {destaque && <span className="legendaAuth">{destaque.name}</span>}
        </div>
      </div>
      <section className="quadroAuth" aria-labelledby="tituloFormularioAuth">
        <p className="sobretitulo">
          {cadastro
            ? "SUA CONTA, SEU PRÓXIMO PASSO"
            : "BEM-VINDO AO HUBESPAÇOS"}
        </p>
        <h2 id="tituloFormularioAuth">
          {cadastro ? "Vamos começar?" : "Acesse sua conta"}
        </h2>
        <p className="descricaoFormularioAuth">
          {cadastro
            ? "Preencha os dados abaixo para se cadastrar."
            : "Use seu e-mail e sua senha para entrar."}
        </p>
        {children}
        <Link href="/#catalogo" className="voltarCatalogoAuth">
          <Icone nome="voltar" />
          Explorar sem entrar
        </Link>
      </section>
    </main>
  );
}
