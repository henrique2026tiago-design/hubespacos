"use client";
import Form from "next/form";
import { useFormStatus } from "react-dom";
import { Icone } from "./icone";
function BotaoBusca() {
  const { pending } = useFormStatus();
  return (
    <button className="botao botaoVerde" type="submit" disabled={pending}>
      {pending ? "Buscando..." : "Buscar espaços"}
      <Icone nome="seta" />
    </button>
  );
}
export function BuscaCatalogo({
  busca,
  ordem,
}: {
  busca: string;
  ordem: string;
}) {
  return (
    <Form action="/#catalogo" scroll={false} className="formularioBusca">
      <div className="campoBusca">
        <label htmlFor="busca">O que você procura?</label>
        <div className="entradaComIcone">
          <Icone nome="busca" />
          <input
            id="busca"
            name="busca"
            defaultValue={busca}
            maxLength={120}
            placeholder="Society, quadra coberta, salão..."
            type="search"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="campoOrdem">
        <label htmlFor="ordem">Organizar por</label>
        <select id="ordem" name="ordem" defaultValue={ordem}>
          <option value="nome">Nome do espaço</option>
          <option value="menorPreco">Menor preço por hora</option>
          <option value="maiorCapacidade">Maior capacidade</option>
        </select>
      </div>
      <BotaoBusca />
    </Form>
  );
}
