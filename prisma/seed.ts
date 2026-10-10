import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { del, put } from "@vercel/blob";
import { hashPassword } from "better-auth/crypto";
import sharp from "sharp";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client";

const ambiente = z.object({
  DATABASE_URL: z.string().url().refine(
    (valor) => valor.startsWith("postgresql://") || valor.startsWith("postgres://"),
    "Informe uma conexão PostgreSQL válida.",
  ),
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "Informe o token do Vercel Blob."),
  SEED_OWNER_EMAIL: z.string().trim().email().transform((valor) => valor.toLowerCase()),
  SEED_OWNER_PASSWORD: z.string().min(12).max(128),
}).parse(process.env);

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: ambiente.DATABASE_URL,
    max: 3,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
  }),
});

// Espaços e endereços fictícios para demonstração acadêmica.
// As fotografias devem ser reais e ter autorização de uso.
const espacos = [
  {
    id: "seed-space-arena-society",
    name: "Arena Caparaó Society",
    description: "Campo society com grama sintética, iluminação LED e redes laterais. Indicado para partidas de futebol de sete e treinos de equipes. Capacidade inclui atletas e acompanhantes. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; após esse prazo, cobrança de 50% do valor reservado.",
    capacity: 40,
    pricePerHour: "120.00",
    pricePeakHour: "160.00",
    location: "Rua das Palmeiras, 120 — Centro, Alegre — ES (endereço fictício)",
    amenities: ["Grama sintética", "Iluminação LED", "Vestiários", "Bebedouro", "Estacionamento"],
    foto: "01Society.jpg",
  },
  {
    id: "seed-space-quadra-coberta",
    name: "Quadra Coberta Horizonte",
    description: "Quadra poliesportiva coberta, com marcações para futsal, vôlei e basquete, arquibancada lateral e piso nivelado. Ideal para jogos escolares e encontros esportivos. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 80,
    pricePerHour: "90.00",
    pricePeakHour: "125.00",
    location: "Avenida do Esporte, 85 — Vila do Sul, Alegre — ES (endereço fictício)",
    amenities: ["Cobertura", "Tabelas de basquete", "Rede de vôlei", "Arquibancada", "Banheiros"],
    foto: "02QuadraCoberta.jpg",
  },
  {
    id: "seed-space-beach-tennis",
    name: "Estação Areia Beach Tennis",
    description: "Quadra de areia lavada para beach tennis e vôlei de praia, com iluminação e área sombreada para descanso. Rede e marcações inclusas; raquetes não inclusas. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 20,
    pricePerHour: "65.00",
    pricePeakHour: "85.00",
    location: "Rua do Ipê, 240 — Parque Verde, Guaçuí — ES (endereço fictício)",
    amenities: ["Areia lavada", "Rede ajustável", "Iluminação", "Ducha externa", "Área de descanso"],
    foto: "03BeachTennis.jpg",
  },
  {
    id: "seed-space-tenis",
    name: "Clube da Serra Tênis",
    description: "Quadra de tênis ao ar livre com piso de saibro, rede oficial e bancos junto à lateral. Indicada para partidas e aulas particulares. Equipamentos pessoais não inclusos. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 12,
    pricePerHour: "75.00",
    pricePeakHour: "100.00",
    location: "Alameda das Montanhas, 55 — Alto da Serra, Guaçuí — ES (endereço fictício)",
    amenities: ["Piso de saibro", "Rede oficial", "Iluminação", "Bancos", "Banheiros"],
    foto: "04Tenis.jpg",
  },
  {
    id: "seed-space-salao",
    name: "Salão Jardim dos Ipês",
    description: "Salão para aniversários, confraternizações e pequenas recepções, com mesas, cadeiras e cozinha de apoio. Montagem e desmontagem devem estar dentro das horas contratadas. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 100,
    pricePerHour: "180.00",
    pricePeakHour: "230.00",
    location: "Rua dos Jardins, 310 — Jardim Primavera, Alegre — ES (endereço fictício)",
    amenities: ["Mesas e cadeiras", "Cozinha de apoio", "Ar-condicionado", "Banheiro acessível", "Wi-Fi"],
    foto: "05Salao.jpg",
  },
  {
    id: "seed-space-chacara",
    name: "Chácara Recanto das Águas",
    description: "Área de eventos com gramado, varanda coberta e churrasqueira para encontros familiares. Não inclui hospedagem ou piscina. Montagem e limpeza durante a reserva. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 60,
    pricePerHour: "150.00",
    pricePeakHour: "195.00",
    location: "Estrada do Recanto, km 3 — Zona Rural, Alegre — ES (endereço fictício)",
    amenities: ["Gramado", "Varanda coberta", "Churrasqueira", "Cozinha", "Estacionamento"],
    foto: "06Chacara.jpg",
  },
  {
    id: "seed-space-auditorio",
    name: "Auditório Conexão Caparaó",
    description: "Auditório para palestras, oficinas e apresentações, com cadeiras, projetor e sistema de som básico. O período contratado inclui a preparação dos equipamentos. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 70,
    pricePerHour: "110.00",
    pricePeakHour: "145.00",
    location: "Avenida Central, 420 — Centro, Guaçuí — ES (endereço fictício)",
    amenities: ["Projetor", "Tela de projeção", "Microfone", "Ar-condicionado", "Wi-Fi", "Acesso por rampa"],
    foto: "07Auditorio.jpg",
  },
  {
    id: "seed-space-estudio",
    name: "Estúdio Movimento",
    description: "Sala ampla para dança, yoga e atividades em grupo, com espelhos, piso vinílico e ventilação. Não inclui instrutor; calçados e atividades devem ser adequados ao piso. Horário de pico: das 18h às 22h. Cancelamento gratuito até 24 horas antes; depois, cobrança de 50%.",
    capacity: 25,
    pricePerHour: "55.00",
    pricePeakHour: "75.00",
    location: "Rua da Cultura, 64 — Centro, Alegre — ES (endereço fictício)",
    amenities: ["Espelhos", "Piso vinílico", "Caixa de som", "Ventilação", "Banheiros"],
    foto: "08Estudio.jpg",
  },
] as const;

async function executarSeed() {
  // Valida todas as fotos antes de gravar no banco ou enviar ao Blob.
  const fotos = await Promise.all(espacos.map(async (espaco) => {
    const arquivo = new URL("./seedImages/" + espaco.foto, import.meta.url);
    const bytes = await readFile(arquivo);
    const jpegValido = bytes.length >= 4
      && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!jpegValido || bytes.length > 2 * 1024 * 1024) {
      throw new Error(espaco.foto + ": use JPEG real de até 2 MiB.");
    }
    // Decodifica e reencoda: não confia somente na extensão ou assinatura.
    const imagem = sharp(bytes, { limitInputPixels: 40_000_000 });
    const metadados = await imagem.metadata();
    if (metadados.format !== "jpeg") throw new Error("Formato inválido: " + espaco.foto);
    const segura = await imagem.rotate().resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    }).jpeg({ quality: 85 }).toBuffer();
    if (segura.length > 2 * 1024 * 1024) throw new Error("Foto excede 2 MiB: " + espaco.foto);
    return segura;
  }));

  const usuarioExistente = await prisma.user.findUnique({
    where: { email: ambiente.SEED_OWNER_EMAIL },
  });
  // Impede que o seed altere uma conta pessoal que já exista.
  if (usuarioExistente && usuarioExistente.id !== "seed-owner-hubespacos") {
    throw new Error("Use um e-mail exclusivo para o proprietário do seed.");
  }

  const senhaHash = await hashPassword(ambiente.SEED_OWNER_PASSWORD);
  const proprietario = await prisma.$transaction(async (tx) => {
    const usuario = await tx.user.upsert({
      where: { email: ambiente.SEED_OWNER_EMAIL },
      update: {},
      create: {
        id: "seed-owner-hubespacos",
        name: "Equipe HubEspaços",
        email: ambiente.SEED_OWNER_EMAIL,
        emailVerified: false,
      },
    });
    await tx.account.upsert({
      where: {
        providerId_accountId: { providerId: "credential", accountId: usuario.id },
      },
      // Reexecutar não troca a senha existente.
      update: {},
      create: {
        id: randomUUID(),
        userId: usuario.id,
        providerId: "credential",
        accountId: usuario.id,
        password: senhaHash,
      },
    });
    return usuario;
  });

  for (const [indice, espaco] of espacos.entries()) {
    const existente = await prisma.space.findUnique({ where: { id: espaco.id } });
    if (existente) {
      if (existente.ownerId !== proprietario.id) {
        throw new Error("Conflito de proprietário no espaço " + espaco.name);
      }
      console.info("Preservado: " + espaco.name);
      continue;
    }

    const imagem = await put("hubespacos/seed/" + espaco.foto, fotos[indice]!, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
      token: ambiente.BLOB_READ_WRITE_TOKEN,
    });
    try {
      const { foto, ...dados } = espaco;
      void foto;
      await prisma.space.create({
        data: {
          ...dados,
          amenities: [...dados.amenities],
          ownerId: proprietario.id,
          imageUrl: imagem.url,
        },
      });
    } catch (erro) {
      // Limpa o upload se a gravação falhar, sem esconder o erro original.
      await del(imagem.url, { token: ambiente.BLOB_READ_WRITE_TOKEN }).catch(() => {
        console.error("Não foi possível remover a foto do upload que falhou.");
      });
      throw erro;
    }
    console.info("Criado: " + espaco.name);
  }

  const quantidade = await prisma.space.count({
    where: { id: { in: espacos.map((espaco) => espaco.id) } },
  });
  if (quantidade !== 8) throw new Error("O catálogo deve conter os oito espaços do seed.");
  console.info("Seed concluído: 8 espaços com fotografias no Vercel Blob.");
}

executarSeed()
  .catch((erro: unknown) => {
    // Não imprime objetos de conexão, tokens ou senhas.
    if (erro instanceof z.ZodError) {
      console.error(erro.issues.map((item) => item.path.join(".") + ": " + item.message).join("\n"));
    } else {
      console.error("Seed interrompido. Confira credenciais, fotos, migrations e conexão.");
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
