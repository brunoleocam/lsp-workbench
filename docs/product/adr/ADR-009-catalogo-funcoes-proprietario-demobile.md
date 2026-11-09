# ADR-009 — Catálogo de funções extra (proprietário, fora do repo público)

## Status

Aceito (2026-11-06) — decisões D1, D7 e D8 do [PDR-012](../pdr/PDR-012-paridade-compilador-senior.md); etapas 3 e 6c.

## Contexto

O catálogo embutido da LSP Workbench tem ~1529 funções, montado a partir da documentação pública Senior (HCM/ERP) e de `docs/lsp`. Ele tem boa documentação, mas:

- `LspFunctionParam` não tem flag de saída: `End` só aparece no texto de `detail`/`documentation`;
- não há variantes (sobrecargas);
- faltam funções que existem no Sapiens e não estão na doc pública (481 delas, ex.: família `AD*`, `BuscaLogEventos_*`, `AdicionarResultado`, `Aguarde`, `AlfaParaFlutuante`).

A extensão interna `senior-lsp` tem `funcoes.json` com 1173 funções extraídas dos binários do Sapiens (`nome`, `assinatura`, `params[{tipo, saida, nome}]`, `variantes`, `origem`) e `dicionario.json` com o dicionário de dados (77 tabelas e 478 campos a mais que o `catalog.json` da demobile). Esses arquivos são derivados de software proprietário Senior e, por virem do binário, são **mais confiáveis que a nossa doc** (PDR-012, D1).

Decisão do usuário: esses dados vão para a extensão privada `lsp-workbench-demobile` (`C:\Dev\lsp-workbench-demobile`, `packages/lsp-workbench-demobile`) e **nunca** para o repo público. A extensão pública só define um contrato para carregar um catálogo extra.

## Decisão

### 1. Formato do arquivo (`lsp-workbench-functions/v1`)

```json
{
  "$schema": "lsp-workbench-functions/v1",
  "generatedAt": "2026-11-06T00:00:00Z",
  "source": "texto livre (ex.: extraído de sapienssrv.exe 5.10.4)",
  "functions": {
    "adicionarresultado": {
      "nome": "AdicionarResultado",
      "assinatura": "Funcao AdicionarResultado(Alfa Linha);",
      "params": [{ "tipo": "alfa", "saida": false, "nome": "Linha" }],
      "variantes": [[{ "tipo": "alfa", "saida": false, "nome": "Linha" }]],
      "origem": ["Sapiens\\sapienssrv.exe"]
    }
  }
}
```

- Chave = nome em minúsculas. `tipo` ∈ `alfa | numero | data | lista | cursor | ?` (case-insensitive; outro valor = desconhecido). `saida` = parâmetro `End`.
- `variantes` opcional; ausente = `[params]`.
- `origem` opcional, só informativo.
- **Compatibilidade:** o loader aceita também o mapa cru (objeto cujos valores têm `nome`), ou seja, o `funcoes.json` da `senior-lsp` sem envelope. Assim o repo demobile pode copiar o arquivo sem script de conversão.
- Arquivo inválido (JSON quebrado, sem `functions` nem mapa) → ignorado com uma linha no output channel; nunca derruba a extensão.

O exemplo público fica em `docs/product/schema/functions.example.json` (a criar na etapa 3; 3 funções inventadas/documentadas publicamente, sem dado extraído de binário).

### 2. Descoberta

Ordem, primeiro que existir vence:

1. `lsp.functions.path` (absoluto ou relativo à primeira pasta do workspace).
2. Qualquer extensão instalada cujo `package.json` declare:

   ```json
   "lspWorkbench": { "functionsCatalog": "functions/functions.json" }
   ```

   O caminho é relativo ao `extensionPath` dela. Se mais de uma declarar, vence a primeira em ordem alfabética de ID e as demais são registradas no output channel (sem merge entre extras nesta versão).
3. Nenhum → só o catálogo embutido (comportamento atual + inferência de `End` pela doc).

A extensão demobile passa a declarar `lspWorkbench.functionsCatalog`. Sem API/`exports`: leitura por path não depende de ordem de ativação. A chave genérica permite que outra empresa publique o próprio catálogo sem hardcode de ID na extensão pública.

O language server (`language-client.ts`) recebe o **path** resolvido em `initializationOptions` e lê o arquivo no processo dele; mudança de `lsp.functions.path` ou de extensões instaladas reinicia o client.

O catálogo de **banco** continua com a resolução atual de PDR-009 (incluindo `demobile.lsp-workbench-demobile` → `catalog/catalog.json`); migrá-lo para a chave genérica (`lspWorkbench.databaseCatalog`) fica como evolução, fora deste ADR.

### 3. Merge (extra vence na estrutura, nossa doc complementa o texto)

Função pura no analyzer: `mergeFunctionCatalog(base: LspFunctionEntry[], extra: ExtraFunctionCatalog): LspFunctionEntry[]`.

Tipos novos (etapa 3):

- `LspFunctionParam.out?: boolean`
- `LspFunctionEntry.variants?: LspFunctionParam[][]`
- `LspFunctionEntry.origin?: "docs" | "extra" | "merged"`

Regras:

| Caso | Resultado |
|------|-----------|
| Função só no embutido | Igual hoje; `params[i].out` inferido de `End` na assinatura documentada; `origin: "docs"` |
| Função nos dois | **Do extra:** assinatura (`detail`), `params` (nome, tipo, `out`), `variants`, `insertText` gerado a partir dos params do extra. **Do embutido:** `system`, descrição, exemplos e link da doc em `documentation` (o bloco de assinatura dentro da doc é substituído pela assinatura do extra); `params[i].description` do embutido quando o nome do param bate (case-insensitive). `origin: "merged"` |
| Função só no extra | Nova entrada: `label = nome`, `detail = assinatura`, `documentation = assinatura + "Sem documentação pública (catálogo extra)."`, `insertText` snippet com os nomes dos params, `origin: "extra"`. Sem `system` |
| Nome conflita com `Definir Funcao` do usuário | Função do usuário vence (regra atual de escopo) |

O merge não remove nenhuma função do embutido. Divergências (nº de params, tipo, `End`) entre embutido e extra são resolvidas a favor do extra e contadas num resumo no output channel (para revisar a doc).

### 4. Dicionário de dados (repo demobile)

O `dicionario.json` não entra no contrato da extensão pública. No repo demobile, um script Node reproduzível mescla o `dicionario.json` no `catalog/catalog.json` existente (formato PDR-009):

- acrescenta tabelas e campos ausentes (tipo, tamanho, decimais, descrição, enum quando houver);
- em conflito, o `catalog.json` atual **vence** (tem enums e PK);
- saída estável (chaves ordenadas), idempotente, com resumo (+77 tabelas, +478 campos esperados);
- edição manual do `catalog.json` gerado não é permitida; mudanças passam pelo script.

### 5. Segurança e licença

- Repo público (MIT): **não** versiona `funcoes.json`, `dicionario.json`, `functions.json` nem derivados. Acrescentar ao `.gitignore`: `**/funcoes.json`, `**/dicionario.json`, `**/functions/functions.json`.
- Checagem no CI do repo público (script simples): falha se algum arquivo versionado tiver o envelope `lsp-workbench-functions/v1` com mais de 10 funções, ou contiver `sapienssrv.exe` em `origem`.
- Tabelas e campos de cliente ficam só no repo demobile (decisão de 2026-11-09). Pode ficar no público o que está na documentação pública da Senior (catálogos ERP/HCM extraídos dela, tabelas padrão como `E085CLI` nos exemplos). Não pode: tabela ou campo `USU_` real, regra ou relatório de cliente. O mesmo script falha em qualquer arquivo de texto (versionado ou novo não ignorado) com `USU_` fora da lista de fictícios (`USU_T999ZZZ`, `USU_T999AAA`, `USU_CAMPOA`, `USU_CAMPOB`, `USU_ALFA`, `USU_ZETA`). O relatório `RDCG183` e o `fixtures/test.lsp` saíram do repo e do histórico.
- Repo demobile (privado): versiona `packages/lsp-workbench-demobile/functions/functions.json`, o `dicionario.json` de entrada e o script de merge; VSIX demobile distribuído só internamente. `.vscodeignore` da demobile precisa **incluir** `functions/` e excluir `dicionario.json`.
- Código: reimplementado em TypeScript; nada copiado da `senior-lsp`. Textos de mensagem do compilador podem ser usados nos diagnósticos (D1).
- Testes do repo público usam fixture sintética (funções inventadas). Testes com o arquivo real ficam no repo demobile.
- Hover/completion de função `origin: "extra"` não mostra `origem` (nomes de executáveis), só assinatura.

## Alternativas

- **Nossa doc vence no merge.** Rejeitada (D1): a assinatura extraída do binário é a que o compilador usa.
- **ID fixo `demobile.lsp-workbench-demobile` + `<extensionPath>/functions/functions.json`.** Rejeitada (D7): amarra a extensão pública a um fornecedor; a chave genérica custa o mesmo.
- **`exports` da extensão provedora (`activate()` retorna `{ functionsCatalogPath }`).** Rejeitada: exige ativar a provedora antes e tratar ordem de ativação.
- **Embutir os dados na extensão pública.** Rejeitada: dado proprietário.
- **Python lendo os binários do Sapiens em runtime.** Rejeitada: fora de escopo (PDR-012) e dependência externa.

## Consequências

- Quem não tem a demobile continua com o catálogo atual, agora com `End` estruturado inferido da doc.
- Quem tem a demobile ganha 481 funções a mais, variantes e assinaturas corretas, e FUN010 vira erro (sem catálogo extra é aviso, D3).
- Hover de funções `merged` pode mostrar assinatura diferente da doc pública Senior; isso é esperado.
- Atualizar o catálogo extra ou o dicionário = nova versão do VSIX demobile; sem mudança no público.
- Analyzer deixa de depender só do singleton `LSP_FUNCTION_CATALOG`: `analyzeLsp` recebe o catálogo efetivo por opção.

## Riscos

- Catálogo extra com erro de extração sobrescreve uma assinatura correta da doc → resumo de divergências no output channel; correção no repo demobile.
- Extensão de terceiros declara `lspWorkbench.functionsCatalog` com conteúdo ruim → `lsp.functions.path` tem precedência e o arquivo inválido é ignorado.

## Relacionados

- [PDR-012](../pdr/PDR-012-paridade-compilador-senior.md)
- [PDR-009](../pdr/PDR-009-catalogo-base-overlay.md), PDR-007
- ADR-001, ADR-005
