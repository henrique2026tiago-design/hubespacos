# HubEspaços — primeira etapa

Esta entrega contém a modelagem, dependências, configuração do Prisma e seed.
ATENÇÃO: a versão exigida @vercel/blob@^0.28.0 não está publicada no npm.
O package.json mantém literalmente esse requisito, mas npm install retorna
ETARGET. Não existe instalação funcional com essa combinação exata.
Para seguir com a última versão publicada da série 0.x, aplique a correção
explícita abaixo antes de instalar e registre essa divergência com o professor.
As páginas, Server Actions, autenticação HTTP e deploy serão implementados nas
próximas etapas. O login do proprietário do seed poderá ser usado quando o
Better Auth estiver conectado à aplicação.

## 1. Preparar o projeto

Use Node.js 22 LTS, versão 22.12 ou superior da série 22, Git e um editor.
Os comandos abaixo são para Git Bash no Windows, ou bash no Linux/macOS.

```bash
node --version
npm --version
git --version
npx create-next-app@16.3.0 hubespacos --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --disable-git
cd hubespacos
```

Se o assistente perguntar sobre React Compiler, escolha No nesta etapa.
Extraia o ZIP da entrega em uma pasta temporária. Copie seu conteúdo para
a pasta hubespacos, substituindo package.json e preservando todos os arquivos
gerados pelo create-next-app. A raiz deve conter package.json e
prisma.config.ts; prisma deve conter schema.prisma, seed.ts e constraints.sql.
Não crie uma segunda pasta hubespacosEtapa1 dentro do projeto.

Acrescente ao final do .gitignore gerado:

```gitignore
# Somente o exemplo vazio pode ser versionado.
!.env.example
/src/generated/prisma/
/prisma/seedImages/
*.tsbuildinfo
```

O .gitignore do create-next-app já ignora .env* e node_modules.
Preserve o README gerado, inclusive o texto inicial com o link do
create-next-app. O modelo exato do professor será preenchido na etapa de
documentação; ele não foi fornecido nesta solicitação.

```bash
npm pkg set 'dependencies.@vercel/blob=0.27.3'
npm install
cp .env.example .env
```

O postinstall deve gerar src/generated/prisma. Versione package-lock.json;
nos próximos clones use npm ci. Blob e Zod conservam os intervalos
explicitamente solicitados no arquivo original; após a correção necessária,
Blob fica fixado em 0.27.3. O lockfile registra as versões resolvidas.

## 2. Configurar Neon, Blob e variáveis

Crie um projeto PostgreSQL no Neon e uma branch de desenvolvimento.
Copie as URLs dessa mesma branch para .env:

- DATABASE_URL: URL pooled, com host contendo -pooler.
- DATABASE_URL_UNPOOLED: URL direta, sem -pooler.
- Preserve os parâmetros TLS fornecidos pelo Neon.

Crie uma segunda branch auxiliar, exclusiva para shadow database, e
coloque sua URL direta em SHADOW_DATABASE_URL. Nunca use a URL principal
como shadow: o Prisma pode apagar o conteúdo do banco auxiliar.

Na Vercel, crie um projeto e um armazenamento Vercel Blob público vinculado
ao projeto. Copie seu token para BLOB_READ_WRITE_TOKEN somente no .env local.

Gere o segredo:

```bash
openssl rand -base64 32
```

Copie o resultado para BETTER_AUTH_SECRET. Defina
BETTER_AUTH_URL=http://localhost:3000 no ambiente local.
Preencha SEED_OWNER_EMAIL com um e-mail exclusivo que você controla.
Gere uma senha exclusiva de 12 a 128 caracteres para SEED_OWNER_PASSWORD;
pode usar outro resultado de openssl rand -base64 32. Não publique nem
compartilhe essa senha. A conta não terá privilégios globais de administrador.

Na Vercel, as cinco variáveis exigidas deverão ser cadastradas quando
configurarmos o deploy: DATABASE_URL, DATABASE_URL_UNPOOLED,
BETTER_AUTH_SECRET, BETTER_AUTH_URL e BLOB_READ_WRITE_TOKEN.
BETTER_AUTH_URL será a URL HTTPS de produção nesse ambiente.
As variáveis de seed e shadow não são necessárias para o build de produção.
Não execute o seed durante build ou postinstall.

## 3. Gerar e aplicar a primeira migration

Use um banco de desenvolvimento novo. A migration inicial já está no pacote,
gerada com Prisma 7.10.0. Ela inclui o conteúdo de constraints.sql, que acrescenta
CHECKs e exclusão de sobreposição, recursos SQL que o schema Prisma não
expressa. PENDING e CONFIRMED bloqueiam o intervalo; CANCELLED o libera.
Reservas consecutivas são permitidas. Não são permitidas reservas atravessando
meia-noite: deverão ser divididas por dia em uma implementação futura.

```bash
npx prisma format
npm run db:validate
npm run db:deploy
npm run db:generate
npx prisma migrate status
```

O último comando deve indicar que o schema está atualizado. A pasta
prisma/migrations e migration_lock.toml precisam entrar no Git.
Não edite uma migration já aplicada. Não use db push no lugar das migrations.
Em produção, migrate deploy aplica essas migrations sem usar shadow database.
Para alterações futuras de schema em desenvolvimento, use
npx prisma migrate dev --name descricao_da_alteracao. O shadow database
só será utilizado nesse comando. Não acrescente constraints.sql novamente
à migration do pacote.

## 4. Preparar as oito fotografias reais e executar o seed

```bash
mkdir -p prisma/seedImages
```

Adicione fotos próprias ou licenciadas em JPEG real, cada uma com até
2 MiB (2.097.152 bytes), usando estes nomes exatos:

| Arquivo | Conteúdo |
| --- | --- |
| 01Society.jpg | Campo society com grama sintética |
| 02QuadraCoberta.jpg | Quadra poliesportiva coberta |
| 03BeachTennis.jpg | Quadra de beach tennis |
| 04Tenis.jpg | Quadra de tênis de saibro |
| 05Salao.jpg | Salão de eventos |
| 06Chacara.jpg | Chácara com área de convivência |
| 07Auditorio.jpg | Auditório |
| 08Estudio.jpg | Estúdio de dança ou atividades |

Não renomeie PNG para JPG; exporte/converta a imagem para JPEG.
Os oito negócios e endereços são fictícios, identificados no próprio seed;
as imagens são fotografias reais ilustrativas e não comprovam sua existência.
O pacote não inclui fotografias nem inventa URLs do Vercel Blob.

```bash
npm run db:seed
npm run db:studio
```

No Studio, confira 8 registros em Space, 1 usuário do seed e 1 Account
credential, com password contendo hash. Confira que cada imageUrl é uma
URL pública do Vercel Blob e abra as oito URLs no navegador.
Execute db:seed novamente: devem ser preservados os oito registros e
nenhuma foto adicional deve ser enviada. Não rode seeds em paralelo.
O seed valida e decodifica todas as fotos antes de iniciar; em falha parcial,
os registros concluídos permanecem e a execução seguinte continua os faltantes.
Não sobrescreve espaços existentes nem troca senhas existentes.

## 5. Testar esta etapa

Encerre o Studio com Ctrl+C e execute:

```bash
npm run db:validate
npm run typecheck
npm run lint
npm run build
npm run dev
```

O build exige Neon acessível e migrations aplicáveis: o script inclui
prisma migrate deploy exatamente como solicitado. Em localhost:3000,
deve aparecer a página inicial gerada pelo Next.js; o catálogo e seu design
ainda não pertencem a esta etapa. Encerre dev com Ctrl+C.
O preço é Decimal; trate-o como decimal/string ao calcular no servidor.
Use America/Sao_Paulo para interpretar datas e horários locais.
A próxima etapa definirá horários de funcionamento, regras de pico e
cancelamento em código, e tratará conflitos de reserva em mensagens de formulário.

## 6. Primeiro commit e push para GitHub

Crie um repositório público vazio chamado hubespacos no GitHub.
Não inicialize README, licença ou .gitignore pelo GitHub.
No terminal do projeto:

```bash
git init
git branch -M main
git config user.name "SEU NOME"
git config user.email "SEU EMAIL DO GITHUB OU EMAIL NOREPLY"
git check-ignore .env
git check-ignore src/generated/prisma/client.ts
git check-ignore prisma/seedImages/01Society.jpg
git add .
git diff --cached --name-only
```

Os três check-ignore devem mostrar os caminhos ignorados.
Na lista preparada para commit deve aparecer .env.example, mas não .env,
node_modules, fotos locais ou cliente Prisma gerado.
Se .env já tiver sido adicionado, remova-o do índice com git rm --cached .env
antes de prosseguir. Se um segredo já tiver sido publicado, rotacione-o.
Confira o conteúdo preparado:

```bash
git diff --cached
git commit -m "feat: inicializa HubEspaços com Prisma, autenticação modelada e seed de espaços"
git remote add origin https://github.com/SEU_USUARIO/hubespacos.git
git push -u origin main
```

Substitua os três valores pessoais antes de executar.
Autentique-se pelo fluxo do GitHub; não use senha/token na URL do remote.
Convide a outra pessoa da dupla como colaboradora. Ela deverá clonar o
repositório, configurar sua própria identidade Git e registrar suas
contribuições reais nas próximas etapas. Não atribua commits fictícios.
Esta etapa não comprova os 15 pontos: produção, CRUDs, busca, autorização,
upload via formulário, UI responsiva e documentação ainda serão verificados.
