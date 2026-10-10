import "server-only";
import { z } from "zod";

// Normaliza o valor monetário como texto: nenhum cálculo financeiro usa float.
const dinheiro = z
  .string()
  .trim()
  .regex(
    /^\d{1,6}([.,]\d{1,2})?$/,
    "Informe um valor de 0,01 a 999.999,99, sem separador de milhares.",
  )
  .transform((texto) => {
    const [inteiro, decimal = ""] = texto.replace(",", ".").split(".");
    return `${BigInt(inteiro)}.${decimal.padEnd(2, "0")}`;
  })
  .pipe(
    z
      .string()
      .refine(
        (valor) => centavos(valor) > BigInt(0),
        "O valor por hora deve ser maior que zero.",
      ),
  );
function centavos(valor: string) {
  return BigInt(valor.replace(".", ""));
}
export const esquemaEspaco = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Use pelo menos 3 caracteres no nome.")
      .max(120, "Use até 120 caracteres no nome."),
    description: z
      .string()
      .trim()
      .min(30, "Descreva o espaço com pelo menos 30 caracteres.")
      .max(5000, "Use até 5.000 caracteres na descrição."),
    capacity: z
      .string()
      .trim()
      .regex(/^\d{1,6}$/, "Informe uma capacidade inteira.")
      .transform(Number)
      .refine(
        (valor) => valor >= 1 && valor <= 100000,
        "A capacidade deve ser de 1 a 100.000 pessoas.",
      ),
    pricePerHour: dinheiro,
    pricePeakHour: dinheiro,
    location: z
      .string()
      .trim()
      .min(10, "Informe um endereço com pelo menos 10 caracteres.")
      .max(240, "Use até 240 caracteres no endereço."),
    amenities: z
      .string()
      .max(2000, "Use até 2.000 caracteres nas comodidades.")
      .transform((texto) => [
        ...new Set(
          texto
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ])
      .pipe(
        z
          .array(
            z.string().max(80, "Cada comodidade deve ter até 80 caracteres."),
          )
          .min(1, "Informe ao menos uma comodidade.")
          .max(20, "Informe até 20 comodidades."),
      ),
  })
  .superRefine((dados, contexto) => {
    if (
      /^\d+\.\d{2}$/.test(dados.pricePerHour) &&
      /^\d+\.\d{2}$/.test(dados.pricePeakHour) &&
      centavos(dados.pricePeakHour) < centavos(dados.pricePerHour)
    ) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pricePeakHour"],
        message: "O valor de pico deve ser igual ou maior que o valor normal.",
      });
    }
  });
export const esquemaIdEspaco = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/);
