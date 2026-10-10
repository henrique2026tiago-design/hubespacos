"use client";
import Image from "next/image";
import { useState } from "react";
import { Icone } from "./icone";
export function ImagemEspaco({
  src,
  alt,
  sizes,
  prioridade = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  prioridade?: boolean;
}) {
  const [falhou, definirFalha] = useState(false);
  let urlValida = false;
  try {
    const url = new URL(src);
    urlValida =
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    /* Uma URL inválida recebe o mesmo fallback acessível. */
  }
  if (!urlValida || falhou)
    return (
      <div
        className="fotoIndisponivel"
        role="img"
        aria-label={alt + " — fotografia indisponível"}
      >
        <Icone nome="foto" />
        <span>Fotografia indisponível</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={prioridade}
      className="fotoEspaco"
      onError={() => definirFalha(true)}
    />
  );
}
