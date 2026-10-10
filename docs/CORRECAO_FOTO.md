# Correção da fotografia no cadastro de espaços

## Problema e alteração

A validação com `failOn: "warning"` recusava também JPEGs decodificáveis com avisos recuperáveis. Usamos `failOn: "error"`, preservando a verificação do conteúdo real, MIME, limite de 2 MiB, 40 milhões de pixels e rejeição de animações. A imagem é decodificada e regravada como JPEG sem os metadados originais.

O formulário cancelava a prévia e o reset automático limpava o campo de arquivo quando a Server Action retornava um erro. O evento de reset agora é cancelado. A fotografia e os demais dados ficam disponíveis para corrigir e reenviar. O sucesso continua redirecionando para Meus espaços.

Erros reais do decodificador são registrados no terminal com diagnóstico limitado a 300 caracteres, sem gravar arquivo ou credenciais. A mensagem para o usuário permanece amigável.

A fotografia específica relatada pelo usuário não foi fornecida. A reprodução comprova uma causa possível; se o problema persistir, verificar o diagnóstico de decodificação e a fotografia original.

## Aplicar no Windows

1. Pare `npm run dev` com Ctrl+C.
2. Extraia o ZIP e copie as pastas `src` e `docs` para a raiz do projeto, mesclando as pastas e substituindo os arquivos correspondentes.
3. Execute, um comando por vez:

```powershell
npm run lint
npm run typecheck
npm run build
npm run dev
```

Não é necessário instalar novas dependências nem executar o seed novamente.

4. Teste cadastrar um espaço com a mesma fotografia JPG, PNG ou WebP de até 2 MB. Confira o registro em Meus espaços e no catálogo.
5. Para testar a preservação após erro, informe um valor de pico menor que o valor normal e envie. Corrija o valor e reenvie: a foto e a prévia devem permanecer no formulário.
6. Se ainda aparecer erro de leitura, envie a fotografia utilizada ou o trecho do terminal começando com `Falha na decodificação da foto:`. Nunca envie `.env`.

Depois dos testes passarem, registre a correção:

```powershell
git add src/lib/fotoEspaco.ts src/components/formularioEspaco.tsx docs/CORRECAO_FOTO.md
git commit -m "fix: preserva foto e ajusta validação de imagens"
git push origin main
```

## Registro de uso de IA

A IA identificou a recusa de avisos recuperáveis e o reset do campo de arquivo após erros. Corrigiu apenas a preparação da imagem e o comportamento do formulário. A reprodução utilizou imagem sintética com aviso, e não a fotografia específica do usuário. O upload real na conta Vercel precisa ser confirmado pelo teste local.
