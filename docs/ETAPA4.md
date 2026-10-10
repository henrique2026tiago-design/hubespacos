# Etapa 4 — CRUD de espaços e upload de fotografias

## Instalação no projeto existente

1. Pare o `npm run dev` com Ctrl+C.
2. Extraia este ZIP e copie seu conteúdo para a raiz do projeto `hubEspacos`, mesclando as pastas `src` e `docs` e substituindo os arquivos indicados. Não crie uma pasta `hubEspacos` dentro da existente.
3. O pacote não inclui `.env`, `package.json`, lockfile, migrations nem fotos do seed. As dependências das etapas anteriores são suficientes. Não é necessário executar migration nova nem repetir o seed.
4. Confira localmente `BLOB_READ_WRITE_TOKEN`. Use o token do armazenamento público Blob já criado para as oito fotos. Não cole o token em código nem no GitHub. Mantenha `BETTER_AUTH_URL=http://localhost:3000` para testar nesse endereço.
5. Se você já preencheu os integrantes e outras informações pessoais no README, preserve-os ao incorporar a seção desta etapa.
6. Na raiz do projeto, execute:

```bash
npm run lint
npm run typecheck
npm run build
npm run dev
```

Abra http://localhost:3000. Para testar o modo produção, pare o dev e execute `npm run start` depois do build. Não execute dev e start na mesma porta simultaneamente.

## Testes manuais antes do commit

1. Preserve os oito registros do seed e crie um espaço separado para os testes de exclusão. Entre com uma conta em `/login`. Em `/conta`, abra **Meus espaços**.
2. Abra `/espacos/novo`, preencha todos os campos e envie uma fotografia real JPG, PNG ou WebP com até 2 MB. Escreva horários de pico e regras de cancelamento na descrição. Use vírgula ou ponto nos valores, sem separador de milhares.
3. Publique. Deve aparecer **Espaço publicado com sucesso.**, e o novo espaço deve estar em `/meus-espacos` e no catálogo público. Confira a foto também no painel Blob da Vercel.
4. Busque pelo nome na página inicial. Abra os detalhes e confirme endereço, capacidade, comodidades e valores.
5. Clique em **Editar e gerenciar**. Altere nome e preço e salve sem escolher outra foto. A fotografia deve ser mantida; as alterações devem aparecer na busca e nos detalhes.
6. Edite novamente e selecione outra fotografia. Salve e confirme que o catálogo apresenta a nova foto.
7. Teste campos inválidos e valor de pico menor que o normal. Confira mensagens claras. Um arquivo de texto renomeado para `.jpg` deve ser recusado no servidor. Uma foto acima de 2 MB deve ser recusada no navegador; a mesma restrição existe no servidor.
8. Faça logout. `/meus-espacos`, `/espacos/novo` e a URL de edição devem levar a `/login`.
9. Entre com uma segunda conta e abra a URL de edição do espaço da primeira conta. Deve mostrar espaço não encontrado, sem formulário de edição. A listagem dessa segunda conta não deve incluir espaços de outra pessoa.
10. Volte à conta criadora, edite o espaço de teste e use **Excluir espaço**. Marque a confirmação e confirme. O registro deve desaparecer do banco, da listagem e da busca. Sem reservas vinculadas, a exclusão é permitida. Com reservas, o servidor impede excluir e preserva o histórico.
11. No DevTools, teste `/conta`, `/meus-espacos`, criação e edição com largura de 375px. Nenhuma página deve ter rolagem horizontal.
12. Repita `npm run build` se tiver alterado algum arquivo durante os testes.

As oito entradas do seed pertencem à conta configurada em `SEED_OWNER_EMAIL`. Uma conta nova começa sem espaços próprios. Não repita o seed para resolver isso: cadastre um espaço pela interface, ou faça login com a conta de demonstração para administrar os dados do seed.

## Commit e push após os testes

```bash
git status --short
git add src/app src/components src/lib next.config.ts README.md docs/ETAPA4.md docs/validacao-etapa4.json
git diff --cached --stat
git commit -m "feat: implementa CRUD de espaços com upload e autorização"
git push origin main
git status --short
```

Confira que `.env` não aparece entre os arquivos preparados para o commit. O último comando deve retornar vazio se não houver mudanças restantes. Cada integrante deve produzir seus próprios commits reais.

## Rotas e decisões

- `/meus-espacos`: lista somente os espaços do usuário autenticado.
- `/espacos/novo`: criação com Server Action, Zod e fotografia obrigatória.
- `/espacos/[id]/editar`: dados privados de gerenciamento, encontrados pelo par `id + ownerId`.
- `/espacos/[id]`: detalhe público existente.
- As três Server Actions conferem sessão no servidor, inclusive quando chamadas diretamente. O proprietário é extraído da sessão, nunca de um campo do formulário.
- Edição e exclusão repetem o filtro de proprietário na mutação. Um filtro por `updatedAt` detecta alterações concorrentes ocorridas durante a ação e pede recarregamento.
- Preços são normalizados como texto decimal e persistidos em `Decimal`; a comparação usa centavos inteiros, sem cálculo financeiro em ponto flutuante.
- As fotos são validadas pelo MIME, tamanho e decodificação com Sharp. Apenas JPEG, PNG e WebP sem animação, até 2 MiB e 40 milhões de pixels. A imagem é rotacionada, redimensionada sem ampliar e convertida para JPEG sem metadados.
- O envio ocorre no servidor com o SDK Blob já instalado. O segredo nunca vai para o navegador. O limite do corpo das Server Actions é 3 MB para comportar a foto de 2 MB e os campos multipart; cada foto continua limitada a 2 MB.
- Uma falha de upload não cria registro. Uma falha de gravação tenta remover a foto recém-enviada. Substituição e exclusão tentam limpar fotos sem referência no banco.
- A limpeza recebe apenas URLs obtidas no servidor, confere o armazenamento do token e o prefixo do proprietário e não remove fotos do seed. Falha de limpeza é registrada sem segredo e não desfaz um cadastro já salvo; pode exigir limpeza posterior do arquivo sem uso.
- A FK `onDelete: Restrict` protege reservas vinculadas. Não há exclusão em cascata de reservas.
- Cadastro de reservas e grade de disponibilidade serão implementados na próxima etapa.

## Verificação realizada nesta entrega

O arquivo `validacao-etapa4.json` registra os testes automáticos executados em produção local, com a migration original aplicada em PostgreSQL isolado (PGlite). A API de Blob foi simulada somente no ambiente de teste, utilizando o SDK instalado; nenhum token real foi utilizado. A aplicação entregue usa o Blob real e precisa da verificação manual do upload na sua conta Vercel.

Foram exercitados CRUD, preços decimais, validação server-side, rejeição de fotografia falsa e arquivo acima do limite, upload de 1.900.000 bytes, falha de upload, compensação em erro de banco, substituição e limpeza de foto, bloqueio de exclusão com reserva, páginas protegidas e reenvio de Server Actions com sessão de outra conta e sem sessão. Interfaces foram verificadas em 375px.

## Registro de uso de IA e correções

Codex/ChatGPT auxiliou na implementação e revisão. Os integrantes devem compreender o código e completar a documentação no modelo do professor.

- O limite padrão de 1 MB das Server Actions impediria a foto permitida de 2 MB. Foi configurado 3 MB para o corpo multipart, preservando a validação de 2 MB por arquivo no servidor.
- A primeira versão da prévia atualizava estado dentro de um efeito React. O lint apontou renderizações adicionais; a criação da URL foi movida para o evento de seleção, mantendo o efeito apenas para liberar a URL.
- Literais BigInt não eram aceitos pelo alvo TypeScript existente; foi usado `BigInt(...)`, sem alterar a configuração do projeto.
- A validação monetária foi encadeada com `pipe` e verificação do formato antes de comparar centavos; entradas malformadas retornam erro de validação, sem lançar exceção ao tentar converter para BigInt.
- Os testes aguardam a conclusão da Server Action antes de iniciar a seguinte, evitando confundir uma mensagem antiga com o resultado de uma requisição em andamento.
