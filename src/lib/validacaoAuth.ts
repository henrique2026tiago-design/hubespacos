import "server-only";
import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Informe um e-mail válido.")
  .max(254, "Use até 254 caracteres no e-mail.")
  .transform((valor) => valor.toLowerCase());
export const esquemaLogin = z.object({
  email,
  password: z
    .string()
    .min(1, "Informe sua senha.")
    .max(128, "Use até 128 caracteres na senha."),
});
export const esquemaCadastro = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres.")
      .max(120, "Use até 120 caracteres no nome."),
    email,
    password: z
      .string()
      .min(12, "Use uma senha com pelo menos 12 caracteres.")
      .max(128, "Use até 128 caracteres na senha."),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
  })
  .refine((dados) => dados.password === dados.confirmarSenha, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmarSenha"],
  });
