# Etapa 2 — Catálogo público

Esta atualização contém apenas os arquivos novos ou alterados para o catálogo. Não contém credenciais, dependências instaladas, cliente Prisma gerado, fotos locais do seed ou a pasta Git.

## Copiar para o projeto atual

1. Feche o servidor de desenvolvimento com Ctrl+C.
2. Extraia o ZIP em uma pasta temporária.
3. Copie o conteúdo extraído para a raiz do projeto existente, onde está o package.json.
4. Aceite substituir os arquivos de mesmo nome. Faça a mesclagem das pastas src e docs; não apague a pasta src inteira.
5. Mantenha seu .env, .git, prisma e as fotos em prisma/seedImages. O .env.example do ZIP é apenas um modelo com valores vazios; não deve substituir seu .env real.
6. Não execute create-next-app novamente.

## Terminal do Windows

Na pasta do projeto:

```bat
npm ci
npm run db:validate
npm run lint
npm run typecheck
npm run build
npm run dev
```

Esta etapa não altera o schema nem cria uma migration nova. O build aplica apenas migrations pendentes. Não repita o seed se os oito registros já estão no Neon.

## Testes manuais

Abra http://localhost:3000:

1. Confira os oito cartões com fotos. Cada cartão apresenta preço fora de pico, preço de pico, capacidade e algumas comodidades.
2. Digite society e envie o formulário: a URL deve conter busca=society e deve aparecer Arena Caparaó Society.
3. Tente coberta: a busca também consulta a descrição.
4. Digite naoexiste123: confira a mensagem exata “Nenhum espaço encontrado”.
5. Limpe a busca, selecione “Menor preço por hora” e envie: Estúdio Movimento deve aparecer primeiro.
6. Selecione “Maior capacidade” e envie: Salão Jardim dos Ipês deve aparecer primeiro.
7. Abra um espaço e confira a descrição completa, todas as comodidades e os dois preços.
8. Acesse /espacos/inexistente: confira a página de espaço não encontrado.
9. Acesse /?ordem=invalida: confira uma mensagem clara sem detalhes internos do banco.
10. Nas ferramentas do navegador, use largura 375px. Verifique a página inicial, o formulário, os cartões e os detalhes; não deve haver rolagem horizontal.
11. Use Tab para navegar e confirme a indicação visual de foco.
12. Recarregue a URL de uma busca e confirme que o resultado continua correto.

A busca consulta nome, descrição e endereço. Não normaliza acentos. O catálogo não simula disponibilidade, avaliação de usuários ou envio de reservas.

## Verificação realizada durante a preparação

O código foi analisado com ESLint e TypeScript. O build completo e a migration inicial foram executados em um banco de teste PGlite, compatível com PostgreSQL, sem acessar credenciais do Neon.

No navegador, passaram: listagem dos oito registros, busca pelo formulário, busca em descrições, as duas ordenações, filtros inválidos, busca sem resultados, detalhes, espaço inexistente e recuperação pela ação Tentar novamente. O catálogo e os detalhes foram verificados em 375px sem rolagem horizontal; a página inicial também foi verificada em 1440px.

As fotografias do teste de navegador usam os JPEGs enviados no projeto, com interceptação das requisições exclusivamente no script externo de QA. O aplicativo entregue sempre usa as URLs reais do banco. Não há mocks ou fallback de registros no código do catálogo.

A integração com seu Neon, a entrega das imagens pelo Blob e o acesso público na Vercel precisam ser confirmados no seu ambiente.

## Commit

Depois dos testes:

```bat
git status --short
git add src/app src/components src/lib next.config.ts eslint.config.mjs package.json package-lock.json README.md docs/ETAPA2.md .env.example
git diff --cached --stat
git commit -m "feat: adiciona catálogo público com busca e layout responsivo"
git push origin main
```

Não adicione .env nem tokens. Se algum caminho listado no git add não existir, confirme que copiou o ZIP na raiz correta.

O passo seguinte será a autenticação e, depois, o CRUD protegido por sessão e proprietário.
