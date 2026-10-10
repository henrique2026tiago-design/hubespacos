# Etapa 3 — Cadastro, login e logout

Esta entrega acrescenta a autenticação ao catálogo já implementado. As rotas novas são /login, /cadastro, /conta e /api/auth/[...all]. Não altera o schema, as migrations ou os oito espaços existentes.

## Aplicar a atualização no Windows

1. Pare npm run dev com Ctrl+C.
2. Extraia o ZIP em uma pasta temporária.
3. Copie o conteúdo para a raiz do projeto atual, mesclando src e docs e substituindo os arquivos de mesmo nome.
4. Preserve seu .env, .git, prisma, package.json e package-lock.json.
5. A pasta src/app/(auth) faz parte da estrutura do Next.js. Os parênteses agrupam as páginas; não aparecem nas URLs.
6. O ZIP também contém src/app/page.tsx com a correção das chaves do formulário e dos resultados.
7. Se você personalizou o README com nomes e turma, mescle a atualização e preserve essas informações.

Não recrie o projeto, não rode o seed novamente e não gere uma migration nova.

## Conferir o ambiente

No .env local, confira:

```dotenv
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=seu_segredo_privado_ja_gerado
```

O texto acima é um exemplo, não um segredo para copiar. Mantenha o segredo aleatório que você já configurou. Ele precisa ter pelo menos 32 caracteres.

Se ainda não gerou o segredo, execute no Git Bash:

```bash
openssl rand -base64 32
```

Copie o resultado somente para o .env. Não envie o .env, o segredo ou o token Blob ao GitHub.

DATABASE_URL e DATABASE_URL_UNPOOLED continuam sendo as conexões do seu Neon. BETTER_AUTH_URL deve ser apenas a origem do aplicativo, sem /api/auth. Abra o navegador usando exatamente http://localhost:3000; se trocar a porta ou o host, atualize essa variável e reinicie o servidor.

Na futura implantação, use a origem HTTPS real da Vercel e o mesmo segredo configurado no ambiente de produção.

## Verificação no terminal

Como não houve mudança nas dependências, basta executar na pasta do projeto:

```bat
npm run db:validate
npm run lint
npm run typecheck
npm run build
npm run dev
```

Se estiver em uma instalação nova, rode npm ci antes desses comandos. O build continua usando exatamente prisma generate && prisma migrate deploy && next build.

## Testes no navegador

1. Sem estar conectado, abra /conta: o navegador deve ir para /login.
2. Abra /cadastro. Informe nome, e-mail e uma senha exclusiva com 12 a 128 caracteres. Confirme a senha.
3. Depois do cadastro, confira que /conta mostra seu nome e e-mail.
4. Recarregue a página: sua sessão deve continuar ativa.
5. No cabeçalho, clique Sair. A sessão deve ser encerrada e a tela de login deve aparecer.
6. Tente acessar /conta novamente: o acesso deve ser bloqueado.
7. Entre usando uma senha incorreta: confira a mensagem E-mail ou senha incorretos.
8. Entre com a senha correta e confira a conta.
9. Confira o botão Mostrar/Ocultar senha.
10. Tente cadastrar outro usuário com o mesmo e-mail: não deve criar uma segunda conta.
11. Acesse / sem login: os oito espaços devem continuar públicos.
12. Pesquise society, coberta e society novamente: deve existir apenas um formulário de busca.
13. Teste /login, /cadastro e /conta em largura 375px; não deve haver rolagem horizontal.

Você pode criar uma conta de teste com qualquer e-mail válido. Não precisa ser o e-mail da Vercel. Não há envio de mensagens de confirmação nesta etapa; a aplicação não pede que você confirme um e-mail que não foi enviado.

A conta criada pelo seed também pode entrar com SEED_OWNER_EMAIL e SEED_OWNER_PASSWORD usados originalmente. Essas variáveis não precisam ser compartilhadas nem inseridas no formulário automaticamente.

## Implementação

- Better Auth 1.7.6 e adaptador Prisma da versão instalada; nenhuma atualização de dependência.
- Adapter com transações PostgreSQL habilitadas.
- Senhas protegidas pelo hash nativo do Better Auth; nenhum armazenamento de senha em texto puro.
- Sessão persistida no banco, cookie HttpOnly e SameSite=Lax; transporte seguro em origem HTTPS.
- Consulta da sessão no servidor, sem confiar no estado visual do cabeçalho.
- /conta verifica a sessão antes de exibir dados pessoais.
- Sessões expiram em sete dias, com atualização diária. O cache de sessão em cookie está desativado para respeitar o estado do banco.
- Validação Zod do nome, e-mail, senha e confirmação também na API, mesmo se o formulário for contornado.
- E-mail normalizado em letras minúsculas; senhas não são recortadas nem transformadas.
- Origem confiável limitada a BETTER_AUTH_URL, mantendo as verificações CSRF do Better Auth.
- Limite básico de tentativas configurado no Better Auth. Seu armazenamento padrão é em memória por instância; não representa um limite distribuído entre todas as funções da Vercel.
- Erros de interface em português, sem exibir detalhes de banco ou configuração privada.
- Metadados de páginas pessoais não permitem indexação.
- O catálogo público continua acessível sem login.

Não foram implementados recuperação de senha, envio de e-mail, redes sociais, CRUD de espaços ou reservas. Essas funções não possuem botões fictícios nesta entrega.

## Validação realizada

ESLint, TypeScript e build completo passaram. Os testes de navegador usaram um banco PGlite isolado com a migration do projeto, sem acessar credenciais do Neon.

Passaram: cadastro; login; senha incorreta; hash validado pelo verificador do Better Auth; cookie HttpOnly; persistência após recarregar; logout com remoção da sessão; acesso protegido; sessão expirada; nome/senha/confirmação inválidos pela API; origem externa rejeitada; e-mail duplicado; limite de tentativas; buscas consecutivas sem duplicação; telas de 375px sem overflow.

As fotografias foram interceptadas apenas no script externo de QA, usando os JPEGs fornecidos no projeto. A aplicação entregue usa as URLs reais do banco. Confirme a integração com seu Neon, a entrega de fotos pelo Blob e, mais adiante, a produção na Vercel.

O relatório resumido está em validacao-etapa3.json.

## Commit e push

Depois de todos os testes no seu ambiente:

```bat
git status --short
git add src/app src/components src/lib README.md docs/ETAPA3.md docs/validacao-etapa3.json
git diff --cached --stat
git commit -m "feat: adiciona cadastro login e logout com Better Auth"
git push origin main
```

O passo seguinte será o CRUD de Space com upload validado e autorização pelo proprietário no servidor.

## Registro de uso de IA

Codex/ChatGPT foi usado para implementar e testar esta etapa. As APIs foram conferidas nos arquivos das versões instaladas e na documentação oficial:

- https://better-auth.com/docs/integrations/next
- https://better-auth.com/docs/authentication/email-password
- https://www.prisma.io/docs/guides/authentication/better-auth/nextjs

Correções registradas:

1. Na etapa 2, formulário e resultados recebiam a mesma key do React, duplicando formulários em buscas consecutivas. Foram adicionados prefixos distintos, e a reprodução foi testada em desenvolvimento e produção.
2. O teste inicial da página protegida esperava sempre HTTP 307. O Next.js pode redirecionar com HTML em respostas de streaming. O teste passou a verificar o redirecionamento real no navegador e a ausência dos dados privados.
3. Confirmação de senha e validação Zod foram incluídas no hook do servidor para que chamadas diretas da API também sejam validadas.
