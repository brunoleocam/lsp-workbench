# PDR-010 — Escopo implícito por projeto de relatório

| Campo | Valor |
|-------|-------|
| Status | Aceito — MVP |
| Data | 2026-09-21 |
| Relacionados | [PDR-008](PDR-008-projeto-relatorio.md), [PDR-003](PDR-003-simbolos-contexto-completion.md), [ADR-007](../adr/ADR-007-formato-projeto-relatorio.md) |

## Problema

Em pastas tipo `Relatórios/RDCGXXX`, `RDCGXXY`, … o modo `lsp.symbols.scope = project` indexa o workspace inteiro: Ctrl+Espaço sugere funções/variáveis de outros relatórios. Criar um `lsp.contexts` por sigla não escala. Prefixo Senior (`RDCG`, `RFEX`, …) **não** é critério seguro.

## Decisão

1. **Detecção** — subir diretórios até achar `relatorio.json` **e** layout válido (`Definicao/` ou `Secoes/`). Sem depender do nome da pasta.
2. **Escopo automático** — ao editar `.lsp` sob esse root, peers de símbolos = só arquivos sob a pasta do relatório (override de `lsp.contexts`).
3. **`contextoExtra`** em `relatorio.json` — lista de paths relativos (pastas ou arquivos) unidos ao escopo, ex. `["../FUNCOES"]`.
4. **Comandos**
   - **Importar Contexto de…** — pasta/arquivo → `contextoExtra` do relatório aberto
   - **Exportar Contexto para…** — escopo do arquivo aberto → outro `relatorio.json` ou entrada em `lsp.contexts`
5. Modo `lsp.symbols.scope = file` continua isolando só o arquivo aberto (vence o overlay).

## `relatorio.json`

```json
{
  "codigo": "RDCGXXX",
  "descricao": "...",
  "detalhePrincipal": "Detalhe_1",
  "contextoExtra": ["../FUNCOES", "../../_shared/helpers.lsp"]
}
```

## Critérios de aceite

| ID | Critério |
|----|----------|
| SCO-01 | Arquivo sob `relatorio.json` válido → peers só daquela pasta |
| SCO-02 | Irmãos (`RDCGXXY`) não entram no Ctrl+Espaço |
| SCO-03 | `contextoExtra` amplia peers |
| SCO-04 | `scope: file` ignora overlay |
| SCO-05 | Fora de relatório → PDR-003 inalterado |
| SCO-06 | Status bar mostra `Relatório · <codigo>` |

## Fora de escopo

- Árvore de siglas Senior (Mercado / Distribuição / …) como regra de isolamento
- Sincronizar `contextoExtra` → `lsp.contexts` automaticamente
