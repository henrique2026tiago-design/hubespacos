"use client";
import { createAuthClient } from "better-auth/react";
// URL relativa: o navegador usa a origem atual, sem receber segredos do servidor.
export const authCliente = createAuthClient({ basePath: "/api/auth" });
