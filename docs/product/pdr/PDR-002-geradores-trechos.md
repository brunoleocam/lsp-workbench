# PDR-002 — Geradores de trechos LSP

| Campo | Valor |
|-------|-------|
| Status | Aceito |
| Commands | `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp` |

## `/gerar-lista-lsp`

**Entrada:** nome da lista + campos `NOME:tipo` (tipo: Alfa | Numero | Data ou literal default).

**Saída mínima:**

```lsp
Definir Lista vlNome;
vlNome.AdicionarCampo("CAMPO", default);
...
vlNome.Adicionar();
```

Respeitar nomenclatura `vl*`, blocos `{ }` se houver fluxo, sem `Retorna`.

## `/gerar-cursor-lsp`

**Entrada:** modo `simples` | `completo`; nome do cursor; SQL opcional.

**Saída:** `Definir Cursor Cur_*`; `.SQL` com quebras `\`; `.Abrir` / loop `.Achou`+`.Proximo` / `.Fechar` (completo). SQL formatado ~coluna 80.

## `/gerar-http-lsp`

**Entrada:** URL (endpoint); formato resposta `json` | `xml`.

**Saída:** variáveis Alfa para URL/corpo; chamada HTTP sem concat em argumento; esqueleto de leitura JSON ou XML conforme padrão em `docs/lsp` / `reference-padroes`; erro com `Mensagem` + `Cancel(1)`.

## Critérios de aceite

- Saída compila sob regras do Agent (`lsp-nucleo`)
- Parâmetros de funções geradas: só `Numero` se houver `Funcao`
- Eval: fixtures em `docs/product/eval/`
