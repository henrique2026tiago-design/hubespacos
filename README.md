# HubEspaços

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Projeto acadêmico do IFES — Nicho 20: aluguel de quadras e espaços de eventos. O desenvolvimento é incremental. Os espaços e endereços do seed são fictícios; as fotografias são reais e devem ter autorização de uso.

## Integrantes

Preencher com os nomes dos dois integrantes, turma e disciplina. Adaptar este documento ao modelo oficial do professor quando ele for fornecido.

Repositório: https://github.com/henrique2026tiago-design/hubespacos

## Estado atual

- Etapa 1: schema, migration, integração Prisma/PostgreSQL e seed de oito espaços com upload validado de JPEG no Blob.
- Etapa 2: catálogo público, busca pela URL no banco, ordenação, detalhes, mensagens de erro, carregamento e interface responsiva.
- Etapa 3: cadastro, login e logout com Better Auth, sessão persistente e página de conta protegida.
- Etapa 4: CRUD completo de espaços, upload de fotos pelo formulário e autorização de proprietário no servidor.
- Próximas etapas: reservas e implantação pública na Vercel.

As tabelas de autenticação e reservas já existem. A autenticação está implementada. O CRUD de espaços está implementado; reservas pela interface ainda estão pendentes. Esta entrega não representa o atendimento completo dos 15 pontos.

## Stack

Next.js 16.3.0, React 19.2.8, TypeScript, Tailwind CSS 4, PostgreSQL/Neon, Prisma 7.10.0, Better Auth 1.7.6, Vercel Blob 0.27.3 e Zod 3. Inter e Plus Jakarta Sans são servidas localmente pelos pacotes Fontsource.

O pacote Blob 0.28.0 solicitado inicialmente não estava disponível no npm; utiliza-se 0.27.3 para evitar o erro ETARGET. Registrar essa diferença na entrega ao professor.

## Getting Started

Requer Node.js compatível com Next.js 16 e Prisma 7. Recomenda-se Node 24 LTS. Na primeira instalação, copie `.env.example` para `.env` e preencha localmente as variáveis. Nunca envie os valores para o GitHub.

```bash
npm ci
npm run db:validate
npm run db:deploy
npm run dev
```

Abra http://localhost:3000. O catálogo lê o banco a cada requisição; é necessário ter o Neon configurado.

Para executar o seed pela primeira vez, coloque as oito fotos JPEG em `prisma/seedImages/` com os nomes definidos em `prisma/seed.ts`. Configure `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD` e o token Blob. O e-mail deve ser exclusivo da conta de demonstração; não precisa ser o e-mail da Vercel.

```bash
npm run db:seed
```

Se os oito espaços já foram inseridos, não é necessário repetir o seed nesta etapa. A aplicação não popula nem altera o banco automaticamente ao abrir o catálogo.

## Variáveis de ambiente

| Variável              | Finalidade                                                 |
| --------------------- | ---------------------------------------------------------- |
| DATABASE_URL          | Conexão pooled do Neon para a aplicação e o seed           |
| DATABASE_URL_UNPOOLED | Conexão direta do Neon para migrations                     |
| BETTER_AUTH_SECRET    | Segredo privado, gerado com `openssl rand -base64 32`      |
| BETTER_AUTH_URL       | Origem do aplicativo; localmente http://localhost:3000     |
| BLOB_READ_WRITE_TOKEN | Token privado do armazenamento Blob                        |
| SEED_OWNER_EMAIL      | E-mail exclusivo do proprietário dos dados de demonstração |
| SEED_OWNER_PASSWORD   | Senha de demonstração com 12 a 128 caracteres              |
| SHADOW_DATABASE_URL   | Opcional, banco separado somente para migrate dev          |

Na Vercel, cadastrar as cinco variáveis principais com valores reais. As variáveis de seed só são necessárias ao executar o seed. Usar uma URL de produção no Better Auth no ambiente de produção.

## Páginas para testar

| Caminho                           | Resultado esperado                                               |
| --------------------------------- | ---------------------------------------------------------------- |
| /                                 | Oito espaços, após o seed                                        |
| /?busca=society                   | Arena Caparaó Society                                            |
| /?busca=coberta                   | Espaços cuja descrição ou nome contém “coberta”                  |
| /?busca=naoexiste123              | “Nenhum espaço encontrado”                                       |
| /?ordem=menorPreco                | Estúdio Movimento primeiro                                       |
| /?ordem=maiorCapacidade           | Salão Jardim dos Ipês primeiro                                   |
| /espacos/seed-space-arena-society | Foto, descrição, comodidades, capacidade e dois valores por hora |
| /espacos/inexistente              | Página de espaço não encontrado                                  |
| /?ordem=invalida                  | Erro amigável de validação dos filtros                           |

O formulário usa GET e mantém a busca na URL. A consulta é feita no PostgreSQL, com parâmetros tratados pelo Prisma; não há lista de demonstração embutida na página. Busca por nome, descrição e endereço, sem distinção entre maiúsculas e minúsculas. A busca não normaliza acentos.

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

O build mantém exatamente `prisma generate && prisma migrate deploy && next build`. O postinstall mantém `prisma generate`.

Testar também o catálogo e os detalhes em 375px no navegador: nenhuma rolagem horizontal; controles acessíveis; busca vazia, busca sem resultados e links de detalhes. Os procedimentos incrementais estão em [docs/ETAPA2.md](docs/ETAPA2.md) e [docs/ETAPA3.md](docs/ETAPA3.md) e [docs/ETAPA4.md](docs/ETAPA4.md).

## Segurança e decisões de implementação

- Prisma e consultas ao banco são módulos restritos ao servidor.
- A projeção pública não inclui e-mail, proprietário, sessões ou contas.
- Filtros são validados no servidor com Zod, incluindo limite de 120 caracteres.
- Imagens externas são aceitas somente de subdomínios públicos do Vercel Blob. Falhas exibem um estado acessível.
- As fontes não dependem de uma requisição ao Google durante o build.
- O CRUD de espaços verifica proprietário no servidor; reservas serão acrescentadas na próxima etapa.
- Credenciais, cliente Prisma gerado e fotografias locais do seed ficam fora do versionamento. `.env.example` contém apenas chaves vazias.

## Uso de IA

Foi usado Codex/ChatGPT para estruturar as etapas, gerar código e auxiliar na depuração. O código precisa ser compreendido e revisado pelos integrantes.

Erros e ajustes registrados:

1. A versão Blob 0.28.0 levou a ETARGET no npm. Foi substituída por 0.27.3.
2. O projeto recebido possuía Zod apenas como dependência transitiva. A etapa 2 declara diretamente a versão 3 compatível com o regulamento.
3. As APIs do Next.js 16.3 foram conferidas na documentação da versão instalada: `searchParams` e `params` são assíncronos; a tela de erro usa `retry`.
4. O catálogo inicial do create-next-app foi substituído por consultas reais ao Prisma e conteúdo responsivo.

## Deploy on Vercel

A implantação será verificada em uma etapa posterior. Importar o repositório, configurar as variáveis de ambiente e confirmar acesso público sem Deployment Protection. Não registrar uma URL de produção como funcional antes de testá-la.

## Pendências para a entrega final

Integrantes e modelo oficial do README; reservas pela interface e testes de conflitos; confirmação de upload no Blob da conta; domínio público de produção; histórico de commits reais de ambos os integrantes. Não fabricar autoria ou retroagir commits.

## Autenticação — Etapa 3

Rotas: `/cadastro`, `/login`, `/conta` e `/api/auth/[...all]`. A página `/conta` verifica a sessão no servidor; usuários sem sessão são redirecionados para `/login`. Cadastro e login normalizam o e-mail e validam entradas no servidor com Zod. Use uma senha de 12 a 128 caracteres. Não há envio de e-mail ou recuperação de senha nesta etapa.

A integração usa Better Auth 1.7.6, sem atualizar a stack. Foram testados cadastro, login, logout, hash da senha, cookie HttpOnly, persistência, expiração e rejeição de origem externa, em banco de teste isolado. O teste inicial que esperava HTTP 307 foi ajustado para verificar o redirecionamento real do Next.js em respostas de streaming.

A duplicação de formulário da etapa 2 foi corrigida com chaves distintas no React; buscas consecutivas passaram nos testes. Os detalhes e o registro de IA estão em `docs/ETAPA3.md`.

## Gerenciamento de espaços — Etapa 4

A conta possui atalhos para `/meus-espacos` e `/espacos/novo`. Cada usuário vê seus espaços e pode criar, editar e excluir os próprios registros com Server Actions. A edição está em `/espacos/[id]/editar`; sessão e proprietário são conferidos no servidor, tanto na leitura quanto na mutação.

O formulário valida dados com Zod e aceita fotografias JPG, PNG e WebP de até 2 MB. Sharp decodifica e otimiza a imagem antes do envio ao Blob. Upload com falha não cria registro; a limpeza de fotos substituídas ou sem referência é limitada ao armazenamento e prefixo do proprietário. Espaços com reservas vinculadas não podem ser excluídos.

Os testes de CRUD, autorização, validação, falhas e responsividade constam em `docs/validacao-etapa4.json`. Foram executados em PostgreSQL isolado e com a API Blob simulada no teste. Confirme o upload real na conta Vercel seguindo `docs/ETAPA4.md`. Não é necessário executar nova migration nem repetir o seed.

O registro de IA desta etapa inclui a correção do limite multipart, da prévia React e da validação decimal, descritas em `docs/ETAPA4.md`.
