import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { Icone } from "@/components/icone";
export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};
export default async function Conta() {
  const { user } = await exigirSessao();
  return (
    <main id="conteudo" className="container paginaConta">
      <p className="sobretitulo">MINHA CONTA</p>
      <h1>Olá, {user.name}.</h1>
      <p className="introducaoConta">
        Você está conectado. Seu próximo encontro pode começar por um novo
        espaço.
      </p>
      <div className="atalhosConta">
        <Link href="/meus-espacos" className="botao botaoVerde">
          Meus espaços <Icone nome="seta" />
        </Link>
        <Link href="/espacos/novo" className="botao botaoNeutro">
          Cadastrar espaço
        </Link>
      </div>
      <div className="gradeConta">
        <section className="dadosConta" aria-labelledby="tituloDadosConta">
          <h2 id="tituloDadosConta">Seus dados</h2>
          <dl>
            <div>
              <dt>Nome</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <p className="notaConta">
            <Icone nome="check" />
            Sessão autenticada
          </p>
        </section>
        <section className="conviteConta">
          <p className="sobretitulo">LUGARES PARA NOVAS IDEIAS</p>
          <h2>
            Encontre o espaço
            <br />
            do seu próximo plano.
          </h2>
          <p>
            Confira fotos, capacidade, comodidades e valores por hora no
            catálogo.
          </p>
          <Link href="/#catalogo" className="botao botaoVerde">
            Explorar espaços <Icone nome="seta" />
          </Link>
        </section>
      </div>
    </main>
  );
}
