# HubEspaços

**Nicho:** Aluguel de quadra ou espaço de eventos · **Grupo:** 03

**Dupla:** HENRIQUE BODEVAN ALONSO (@henrique2026tiago-design) · TIAGO DA SILVA NUNES MORENO (@tiaguiinvz)

**Sistema no ar:** https://hubespacos.vercel.app/

**Repositório:** https://github.com/henrique2026tiago-design/hubespacos

## O que o sistema faz

O HubEspaços permite encontrar quadras, salões e espaços de eventos, comparar preços e consultar a disponibilidade antes de reservar. O catálogo público consulta o banco PostgreSQL e oferece busca pelo nome, descrição ou endereço. Os registros de demonstração possuem nomes e endereços fictícios, com fotografias reais.

Após cadastrar uma conta e entrar, o usuário pode:

- Criar, listar, consultar, editar e excluir os próprios espaços, com fotografia, capacidade, comodidades e preços.
- Enviar fotografias JPG, PNG ou WebP de até 2 MB, validadas no servidor e armazenadas no Vercel Blob.
- Reservar um intervalo disponível e consultar suas reservas.
- Consultar as reservas recebidas pelos espaços dos quais é proprietário.
- Cancelar a própria reserva com pelo menos 24 horas de antecedência, liberando o intervalo.
- Encerrar a sessão com logout.

A agenda funciona das 08h às 23h, no horário de Brasília, com horas inteiras e datas até 90 dias à frente. A tarifa de pico vale das 18h às 22h; o total combina os preços de cada hora. A disponibilidade é atualizada a cada 15 segundos enquanto a aba está visível e conferida novamente no servidor ao confirmar. Reservas ativas não podem se sobrepor. Espaços com reservas vinculadas, inclusive canceladas, não podem ser excluídos, preservando o histórico.

O sistema não processa pagamentos. Após o prazo de cancelamento gratuito, a política demonstrativa prevê 50% do valor, a acertar diretamente com o responsável. Não há recuperação de senha nem confirmação de e-mail implementadas.

A aplicação utiliza Next.js 16.3.0, React, TypeScript, Tailwind CSS, PostgreSQL no Neon, Prisma 7.10.0, Better Auth 1.7.6, Zod e Vercel Blob. As mutações usam Server Actions, com validação e verificação de sessão e proprietário no servidor. O Better Auth protege as senhas com hash.

**Verificações realizadas:** catálogo, busca, detalhes, agenda, cálculo de preços e login foram conferidos no site de produção. Os testes de CRUD, upload, autorização, conflitos, cancelamento e responsividade a 375px passaram em ambiente de teste isolado; nesses testes automatizados, a API Blob foi simulada. Cadastro de espaço com foto e o ciclo de criação/cancelamento de reserva também foram testados localmente durante o desenvolvimento. A revisão automatizada autenticada em produção foi interrompida por uma restrição do navegador de testes, portanto não equivale à aprovação de todas as mutações em produção.

## Páginas para testar

Use os caminhos abaixo após o domínio https://hubespacos.vercel.app:

- Pública: `/` — catálogo de espaços sem necessidade de login; o seed cadastra oito espaços e novos cadastros podem ampliar o catálogo.
- Busca (exemplo que encontra algo): `/?busca=society` — encontra Arena Caparaó Society.
- Busca sem resultados: `/?busca=naoexiste123` — exibe “Nenhum espaço encontrado”.
- Detalhes e agenda pública: `/espacos/seed-space-arena-society` — fotografia, descrição, comodidades, capacidade, valores e disponibilidade.
- Cadastro de usuário: `/cadastro` — permite criar uma conta; a senha deve ter entre 12 e 128 caracteres.
- Login: `/login` — acesso com e-mail e senha.
- Protegida (pede login): `/conta` — dados da conta e atalhos das funções privadas.
- Meus espaços: `/meus-espacos` — lista apenas os espaços do usuário autenticado.
- Cadastro de espaço: `/espacos/novo` — formulário protegido com upload de fotografia.
- Minhas reservas: `/minhas-reservas` — reservas do usuário e cancelamento dentro do prazo.
- Reservas recebidas: `/reservas-recebidas` — reservas dos espaços do proprietário autenticado.

Para testar edição, entre em **Meus espaços**, abra um registro próprio e clique em editar. A rota é `/espacos/<id-do-registro>/editar`; utilize o identificador real exibido pelo aplicativo. Usuários sem sessão são encaminhados ao login; usuários diferentes do proprietário não podem editar ou excluir o registro. O logout está no botão **Sair** do cabeçalho autenticado.

Para testar reservas, escolha uma data três dias à frente, selecione início e fim, confira o total, aceite as condições e confirme. Confira **Minhas reservas**, volte à agenda e verifique o intervalo indisponível. Cancele e confira se o horário ficou livre.

## Banco de dados (tabelas, principais campos e a relação entre elas)

O banco é PostgreSQL hospedado no Neon, acessado pelo Prisma com `@prisma/adapter-pg`. O schema está em `prisma/schema.prisma` e as migrations estão versionadas em `prisma/migrations`.

| Modelo / tabela | Principais campos | Finalidade |
| --- | --- | --- |
| `User` / `user` | `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt` | Usuário, proprietário de espaços e autor de reservas. |
| `Session` / `session` | `id`, `token`, `userId`, `expiresAt`, `ipAddress`, `userAgent`, timestamps | Sessões do Better Auth. |
| `Account` / `account` | `id`, `accountId`, `providerId`, `userId`, `password`, tokens opcionais, timestamps | Credenciais do Better Auth; `password` guarda o hash da senha. |
| `Verification` / `verification` | `id`, `identifier`, `value`, `expiresAt`, timestamps | Estrutura de verificações do Better Auth, sem fluxo de confirmação de e-mail implementado. |
| `Space` | `id`, `name`, `description`, `capacity`, `pricePerHour`, `pricePeakHour`, `location`, `amenities`, `imageUrl`, `ownerId`, timestamps | Quadra ou espaço de eventos. |
| `Reservation` | `id`, `spaceId`, `userId`, `date`, `startTime`, `endTime`, `totalPrice`, `status`, `createdAt` | Reserva associada a um espaço e a um usuário. |

Relações:

- **User 1:N Space:** um usuário pode cadastrar vários espaços; `Space.ownerId` referencia `User.id`.
- **Space 1:N Reservation:** um espaço pode receber várias reservas; `Reservation.spaceId` referencia `Space.id`.
- **User 1:N Reservation:** um usuário pode criar várias reservas; `Reservation.userId` referencia `User.id`.
- **User 1:N Session e Account:** o Better Auth associa sessões e credenciais ao usuário.

Preços usam `Decimal(10,2)`, comodidades usam array de strings, a data da reserva usa `DATE` e os horários usam `TIME`. O enum de status contém `PENDING`, `CONFIRMED` e `CANCELLED`; novas reservas válidas são criadas como `CONFIRMED`. A migration inicial utiliza `btree_gist` e uma constraint de exclusão que impede sobreposição de reservas `PENDING` ou `CONFIRMED`. O servidor também serializa a conferência e inserção com uma transação e bloqueio do espaço. Intervalos adjacentes são permitidos.

## Como rodar no computador

Requisitos: Git, Node.js 24, npm e acesso a um banco PostgreSQL/Neon e a um armazenamento Vercel Blob. Para testes que alteram dados, configure um banco e armazenamento próprios de desenvolvimento.

1. Clone o repositório e entre na pasta:

```bash
git clone https://github.com/henrique2026tiago-design/hubespacos.git
cd hubespacos
```

2. Copie `.env.example` para `.env`. No terminal do Windows (CMD):

```bat
copy .env.example .env
```

No PowerShell, use `Copy-Item .env.example .env`. Preencha as variáveis somente no arquivo local:

| Variável | Configuração |
| --- | --- |
| `DATABASE_URL` | URL pooled do banco Neon, usada pela aplicação. |
| `DATABASE_URL_UNPOOLED` | URL direta do banco Neon, usada pelas migrations. |
| `BETTER_AUTH_SECRET` | Segredo gerado com `openssl rand -base64 32`; no Windows, o comando pode ser executado no Git Bash. |
| `BETTER_AUTH_URL` | Localmente: `http://localhost:3000`. Em produção: `https://hubespacos.vercel.app`. |
| `BLOB_READ_WRITE_TOKEN` | Token privado do armazenamento Vercel Blob. |
| `SEED_OWNER_EMAIL` | E-mail exclusivo da conta de demonstração, necessário apenas para executar o seed. |
| `SEED_OWNER_PASSWORD` | Senha da conta de demonstração, de 12 a 128 caracteres, necessária apenas para executar o seed. |
| `SHADOW_DATABASE_URL` | Opcional, banco separado para desenvolvimento de novas migrations com `prisma migrate dev`. |

O `.env.example` contém chaves sem valores. O `.gitignore` exclui arquivos `.env`, dependências, cliente Prisma gerado e fotografias locais do seed. Não publique credenciais no GitHub. Na Vercel, configure as cinco variáveis principais no ambiente de produção.

3. Instale as dependências, valide o schema e aplique as migrations:

```bash
npm ci
npm run db:validate
npm run db:deploy
```

4. Se estiver usando um banco novo e quiser os oito registros de demonstração, coloque fotografias JPEG autorizadas em `prisma/seedImages/`, com os nomes: `01Society.jpg`, `02QuadraCoberta.jpg`, `03BeachTennis.jpg`, `04Tenis.jpg`, `05Salao.jpg`, `06Chacara.jpg`, `07Auditorio.jpg` e `08Estudio.jpg`. Essas fotografias não são incluídas no repositório. Configure as variáveis de seed e execute:

```bash
npm run db:seed
```

Não é necessário repetir o seed em um banco que já contém os registros. Também é possível começar com o catálogo vazio, criar uma conta e cadastrar espaços pela interface.

5. Inicie o servidor local:

```bash
npm run dev
```

Abra http://localhost:3000. Para verificar a compilação de produção:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

Pare o servidor de desenvolvimento antes de usar `npm run start` na mesma porta. O script de build é exatamente `prisma generate && prisma migrate deploy && next build`; o `postinstall` executa `prisma generate`. O build aplica migrations no banco configurado.

**Ajuste de dependência durante o desenvolvimento:** `@vercel/blob@^0.28.0` produziu o erro `ETARGET` na instalação. Em `package.json`, foi substituído por `@vercel/blob: "0.27.3"`. Essa diferença em relação à versão inicialmente solicitada está registrada para avaliação; Prisma permanece fixado em 7.10.0 e Better Auth em 1.7.6.

## Como usamos a IA

- **IA usada:** ChatGPT/Codex para apoiar a modelagem, implementação incremental, depuração, revisão e documentação. As decisões e o código devem ser compreendidos pelos integrantes.

- **Os 3 pedidos (prompts) que mais ajudaram:**
  1. Pedido inicial de construção incremental do HubEspaços: definir `Space` e `Reservation`, tabelas Better Auth, PostgreSQL/Neon, Prisma 7.10.0, seed de oito espaços, variáveis de ambiente e scripts exigidos pelo trabalho.
  2. “A cada vez que eu pesquiso surge um campo de busca novo”: investigar a duplicação do formulário e corrigir a renderização nas buscas consecutivas.
  3. Relato de falha no cadastro: a foto JPG, PNG ou WebP era recusada com “Não foi possível ler essa foto” e desaparecia após o envio; revisar o decodificador e preservar o arquivo durante a correção dos dados.

- **Um erro da IA que percebemos e como corrigimos (arquivo e o que mudou):**
  O catálogo gerado inicialmente reutilizava a mesma chave React no formulário de busca e no `Suspense` dos resultados. Ao pesquisar várias vezes, apareciam novos campos de busca. Em `src/app/page.tsx`, foram usadas chaves distintas para o formulário e para os resultados, evitando a colisão entre componentes irmãos. A correção foi conferida com buscas consecutivas, mantendo apenas um campo.

  Outra correção específica ocorreu em `src/lib/fotoEspaco.ts`: `failOn: "warning"` recusava um JPEG decodificável que emitia avisos recuperáveis. Foi ajustado para `failOn: "error"`, mantendo a rejeição de arquivos truncados, formatos divergentes, animações e fotos acima de 2 MB. Em `src/components/formularioEspaco.tsx`, o `onReset` passou a chamar `evento.preventDefault()` para preservar o arquivo e a prévia quando a Server Action retorna erro. A reprodução utilizou uma imagem com aviso; a fotografia específica inicialmente relatada não foi fornecida à IA. Detalhes: `docs/CORRECAO_FOTO.md`.

- **O que aprendemos:**
  - Validar os dados no servidor e obter a identidade pela sessão, sem confiar em campos enviados pelo navegador.
  - Conferir a propriedade dos registros em cada operação de edição ou exclusão.
  - Usar `Decimal` e centavos inteiros para calcular preços, incluindo intervalos com tarifas diferentes.
  - Impedir reservas concorrentes com transação e restrição no banco, além de mostrar disponibilidade na interface.
  - Verificar o conteúdo da fotografia, não apenas a extensão, e preservar os dados do formulário após erros.
  - Manter migrations, lockfile, commits reais e variáveis privadas; testar localmente e conferir a versão efetivamente publicada.
  - Distinguir testes em ambiente isolado de verificações realizadas em produção, sem tratar código gerado por IA como automaticamente correto.
