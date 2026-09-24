---
name: lsp-contexto
description: Explica e orienta escopo multiarquivo LSP — lsp.contexts, símbolos e projeto de relatório (paridade com a extensão LSP Workbench).
---

# lsp-contexto

O Agent **não** substitui a UI da extensão. Use este skill para orientar o usuário e gerar JSON de configuração correto.

## Modos (paridade IDE)

| Modo | Como | Extensão |
|------|------|----------|
| Arquivo único | Abrir `.lsp` / `.lspt` | status SingleFile |
| Contextos | `lsp.contexts` no settings | Criar/Editar Contexto |
| Relatório | pasta com `relatorio.json` | escopo automático da pasta + `contextoExtra` |

## `lsp.contexts` (exemplo)

```json
{
  "lsp.symbols.scope": "project",
  "lsp.contexts": [
    {
      "name": "HR",
      "rootDir": "HR",
      "filePattern": "HR*.lspt",
      "includeSubdirectories": false,
      "system": "HCM"
    }
  ]
}
```

`system` (`HCM` / `ERP`): filtra builtins do catálogo unificado na extensão (≥ 0.2.4). Sem `system`, completion mistura plataformas conforme fallback da IDE.

## Projeto de relatório

- Escopo = pasta do `relatorio.json` (não mistura irmãos `RDCGXXX`/`RDCGXXY`) — PDR-010.
- `contextoExtra` em `relatorio.json`: pastas/arquivos compartilhados (ex. `../FUNCOES`).
- Comandos Agent: `/gerar-relatorio`, `/importar-relatorio`, `/escopo-relatorio`, `/copiar-regra-relatorio`.
- Comandos IDE: Importar Relatório, Importar/Exportar Contexto, Mostrar Escopo, Visualizar Todas as Regras.

## O que o Agent deve fazer

1. Perguntar se o usuário está em arquivo único, contexto ou relatório.
2. Não misturar símbolos de pastas fora do escopo ao gerar/refatorar.
3. Em FUN009 / funções externas, lembrar o escopo ativo.
4. Preferir apontar o comando da extensão quando for ação de UI (criar contexto visualmente).
