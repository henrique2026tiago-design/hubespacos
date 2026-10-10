"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { criarEspaco, editarEspaco } from "@/app/espacos/actions";
import type {
  CamposEspaco,
  EspacoFormulario,
  EstadoEspaco,
} from "@/lib/tiposEspaco";
const vazio: CamposEspaco = {
  name: "",
  description: "",
  capacity: "",
  pricePerHour: "",
  pricePeakHour: "",
  location: "",
  amenities: "",
};
const inicial: EstadoEspaco = {};
export function FormularioEspaco({ espaco }: { espaco?: EspacoFormulario }) {
  const [campos, definirCampos] = useState<CamposEspaco>(espaco ?? vazio);
  const [preview, definirPreview] = useState("");
  const [erroFoto, definirErroFoto] = useState("");
  const acao = espaco ? editarEspaco.bind(null, espaco.id) : criarEspaco;
  const [estado, enviar, pendente] = useActionState(acao, inicial);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  function campo(nome: keyof CamposEspaco) {
    return {
      id: nome,
      name: nome,
      value: campos[nome],
      onChange: (
        evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) =>
        definirCampos((atuais) => ({ ...atuais, [nome]: evento.target.value })),
      "aria-invalid": !!estado.erros?.[nome],
      "aria-describedby": estado.erros?.[nome] ? `${nome}-erro` : undefined,
    };
  }
  function erro(nome: keyof CamposEspaco | "foto") {
    return (
      estado.erros?.[nome] && (
        <p className="erroCampoEspaco" id={`${nome}-erro`}>
          {estado.erros[nome]![0]}
        </p>
      )
    );
  }
  return (
    <form
      action={enviar}
      className="formularioEspaco"
      onReset={(evento) => {
        // A ação retorna erros sem sair da página. Preserve o arquivo e a prévia.
        // Quando salva, o redirecionamento desmonta este formulário.
        evento.preventDefault();
      }}
    >
      <fieldset disabled={pendente}>
        <section className="blocoFormularioEspaco">
          <div className="tituloBlocoEspaco">
            <span>01</span>
            <div>
              <h2>Sobre o espaço</h2>
              <p>As informações que ajudam alguém a escolher.</p>
            </div>
          </div>
          <div className="campoEspaco">
            <label htmlFor="name">Nome do espaço</label>
            <input
              {...campo("name")}
              required
              minLength={3}
              maxLength={120}
              placeholder="Ex.: Quadra Coberta Horizonte"
            />
            {erro("name")}
          </div>
          <div className="campoEspaco">
            <label htmlFor="description">Descrição e regras</label>
            <textarea
              {...campo("description")}
              required
              minLength={30}
              maxLength={5000}
              rows={5}
              placeholder="Descreva o espaço, os horários de pico e a política de cancelamento."
            />
            {erro("description")}
            <p className="ajudaCampoEspaco">
              A agenda do HubEspaços funciona das 08h às 23h, com pico das 18h
              às 22h. Cancelamento gratuito pelo sistema até 24h antes; após
              esse prazo, condições diretamente com o responsável.
            </p>
          </div>
          <div className="campoEspaco">
            <label htmlFor="location">Endereço</label>
            <input
              {...campo("location")}
              required
              minLength={10}
              maxLength={240}
              placeholder="Rua, número, bairro, cidade e estado"
            />
            {erro("location")}
          </div>
          <div className="duplaCamposEspaco">
            <div className="campoEspaco">
              <label htmlFor="capacity">Capacidade de pessoas</label>
              <input
                {...campo("capacity")}
                type="number"
                required
                min={1}
                max={100000}
                step={1}
                inputMode="numeric"
                placeholder="Ex.: 40"
              />
              {erro("capacity")}
            </div>
            <div className="dicaEspaco">
              Use a capacidade máxima permitida para o espaço.
            </div>
          </div>
        </section>
        <section className="blocoFormularioEspaco">
          <div className="tituloBlocoEspaco">
            <span>02</span>
            <div>
              <h2>Valores e comodidades</h2>
              <p>Preços claros, antes de qualquer reserva.</p>
            </div>
          </div>
          <div className="duplaCamposEspaco">
            <div className="campoEspaco">
              <label htmlFor="pricePerHour">Fora de pico · R$ / hora</label>
              <input
                {...campo("pricePerHour")}
                required
                inputMode="decimal"
                maxLength={9}
                placeholder="120,00"
              />
              {erro("pricePerHour")}
            </div>
            <div className="campoEspaco">
              <label htmlFor="pricePeakHour">Horário de pico · R$ / hora</label>
              <input
                {...campo("pricePeakHour")}
                required
                inputMode="decimal"
                maxLength={9}
                placeholder="160,00"
              />
              {erro("pricePeakHour")}
            </div>
          </div>
          <p className="ajudaCampoEspaco">
            Use vírgula ou ponto para os centavos, sem separador de milhares. O
            valor de pico deve ser igual ou maior que o valor normal.
          </p>
          <div className="campoEspaco">
            <label htmlFor="amenities">Comodidades inclusas</label>
            <textarea
              {...campo("amenities")}
              required
              maxLength={2000}
              rows={4}
              placeholder={"Estacionamento\nVestiários\nIluminação noturna"}
            />
            {erro("amenities")}
            <p className="ajudaCampoEspaco">
              Uma comodidade por linha, até 20 itens.
            </p>
          </div>
        </section>
        <section className="blocoFormularioEspaco">
          <div className="tituloBlocoEspaco">
            <span>03</span>
            <div>
              <h2>Uma foto real</h2>
              <p>Mostre o espaço com boa iluminação.</p>
            </div>
          </div>
          {(preview || espaco?.imageUrl) && (
            <div className="previewFotoEspaco">
              {/* Preview local usa blob:; a fotografia publicada é servida pelo Next Image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || espaco?.imageUrl}
                alt={
                  preview
                    ? "Prévia da nova fotografia"
                    : "Fotografia atual do espaço"
                }
              />
            </div>
          )}
          <div className="campoEspaco">
            <label htmlFor="foto">
              {espaco
                ? "Substituir a fotografia (opcional)"
                : "Fotografia do espaço"}
            </label>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!espaco}
              aria-invalid={!!erroFoto || !!estado.erros?.foto}
              aria-describedby="ajuda-foto foto-erro"
              onChange={(evento) => {
                const arquivo = evento.target.files?.[0] ?? null;
                definirErroFoto("");
                if (
                  arquivo &&
                  (arquivo.size > 2 * 1024 * 1024 ||
                    !["image/jpeg", "image/png", "image/webp"].includes(
                      arquivo.type,
                    ))
                ) {
                  definirErroFoto(
                    "Selecione uma foto JPG, PNG ou WebP de até 2 MB.",
                  );
                  evento.target.value = "";
                  definirPreview("");
                  return;
                }
                definirPreview(arquivo ? URL.createObjectURL(arquivo) : "");
              }}
            />
            <p id="ajuda-foto" className="ajudaCampoEspaco">
              JPG, PNG ou WebP, até 2 MB. Utilize uma foto que você tenha
              autorização para publicar.
              {espaco && " Sem um novo arquivo, a foto atual será mantida."}
            </p>
            {(erroFoto || estado.erros?.foto) && (
              <p className="erroCampoEspaco" id="foto-erro">
                {erroFoto || estado.erros?.foto?.[0]}
              </p>
            )}
          </div>
        </section>
      </fieldset>
      {estado.mensagem && (
        <div className="alertaEspaco" role="alert">
          {estado.mensagem}{" "}
          {estado.erros?.foto && "Confira a foto ou selecione outro arquivo."}
        </div>
      )}
      <div className="acoesFormularioEspaco">
        <Link href="/meus-espacos" className="botao botaoNeutro">
          Cancelar
        </Link>
        <button
          type="submit"
          className="botao botaoVerde"
          disabled={pendente || !!erroFoto}
        >
          {pendente
            ? "Salvando espaço…"
            : espaco
              ? "Salvar alterações"
              : "Publicar espaço"}
        </button>
      </div>
      <p className="notaFormularioEspaco" role="status">
        {pendente
          ? "Validando os dados e enviando a fotografia. Aguarde."
          : "O espaço ficará visível no catálogo público após salvar."}
      </p>
    </form>
  );
}
