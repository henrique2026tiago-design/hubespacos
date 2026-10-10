"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authCliente } from "@/lib/authCliente";
import { Icone } from "./icone";

function mensagemErro(erro: {
  code?: string;
  message?: string;
  status?: number;
}) {
  if (erro.status === 429)
    return "Muitas tentativas. Aguarde um minuto e tente novamente.";
  if (erro.code === "VALIDATION_ERROR")
    return erro.message || "Confira os dados informados.";
  if (erro.code === "INVALID_EMAIL_OR_PASSWORD")
    return "E-mail ou senha incorretos.";
  if (erro.code === "PASSWORD_TOO_SHORT")
    return "Use uma senha com pelo menos 12 caracteres.";
  if (erro.code === "PASSWORD_TOO_LONG")
    return "Use até 128 caracteres na senha.";
  if (erro.code === "INVALID_EMAIL") return "Informe um e-mail válido.";
  if (erro.code?.startsWith("USER_ALREADY_EXISTS"))
    return "Não foi possível criar a conta. Confira o e-mail ou tente entrar.";
  return "Não foi possível concluir. Confira os dados e tente novamente.";
}
export function FormularioAuth({ modo }: { modo: "login" | "cadastro" }) {
  const cadastro = modo === "cadastro";
  const router = useRouter();
  const [pendente, definirPendente] = useState(false);
  const [erro, definirErro] = useState("");
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (pendente) return;
    const dados = new FormData(evento.currentTarget);
    const email = String(dados.get("email") ?? "");
    const password = String(dados.get("password") ?? "");
    const entradaCadastro = {
      name: String(dados.get("name") ?? ""),
      email,
      password,
      confirmarSenha: String(dados.get("confirmarSenha") ?? ""),
    };
    definirErro("");
    definirPendente(true);
    try {
      const resposta = cadastro
        ? await authCliente.signUp.email(entradaCadastro)
        : await authCliente.signIn.email({ email, password, rememberMe: true });
      if (resposta.error) {
        definirErro(mensagemErro(resposta.error));
        return;
      }
      router.replace("/conta");
      router.refresh();
    } catch {
      definirErro(
        "Não conseguimos conectar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      definirPendente(false);
    }
  }
  return (
    <form onSubmit={enviar} className="formularioAuth" aria-busy={pendente}>
      {erro && (
        <div className="alertaAuth" role="alert" id="erroAuth">
          {erro}
        </div>
      )}
      <fieldset disabled={pendente}>
        {cadastro && (
          <div className="campoAuth">
            <label htmlFor="name">Seu nome</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Como podemos chamar você?"
            />
          </div>
        )}
        <div className="campoAuth">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="voce@exemplo.com"
          />
        </div>
        <div className="campoAuth">
          <label htmlFor="password">Senha</label>
          <div className="entradaSenha">
            <input
              id="password"
              name="password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete={cadastro ? "new-password" : "current-password"}
              required
              minLength={cadastro ? 12 : 1}
              maxLength={128}
              aria-describedby={cadastro ? "ajudaSenha" : undefined}
            />
            <button
              type="button"
              onClick={() => definirMostrarSenha(!mostrarSenha)}
              aria-pressed={mostrarSenha}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
              <span className="somenteLeitor"> senha</span>
            </button>
          </div>
          {cadastro && (
            <p id="ajudaSenha" className="ajudaCampoAuth">
              Use de 12 a 128 caracteres. Prefira uma senha exclusiva.
            </p>
          )}
        </div>
        {cadastro && (
          <div className="campoAuth">
            <label htmlFor="confirmarSenha">Confirme a senha</label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              required
              maxLength={128}
            />
          </div>
        )}
        <button
          className="botao botaoVerde botaoAuth"
          type="submit"
          disabled={pendente}
        >
          {pendente
            ? cadastro
              ? "Criando sua conta…"
              : "Entrando…"
            : cadastro
              ? "Criar minha conta"
              : "Entrar"}
          <Icone nome="seta" />
        </button>
      </fieldset>
      <p className="alternarAuth">
        {cadastro ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link href={cadastro ? "/login" : "/cadastro"}>
          {cadastro ? "Entre aqui" : "Crie sua conta"}
        </Link>
      </p>
    </form>
  );
}
