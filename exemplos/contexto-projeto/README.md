# Contexto de projeto (exemplo PDR-003)

Arquivos para validar completion cross-file na extensão LSP Workbench.

| Arquivo | Papel |
|---------|--------|
| `operacoes.lsp` | Funções elegíveis (`Definir` + `Funcao`) com LSPDoc |
| `main.lsp` | Consome as funções — Ctrl+Espaço lista com origem; FUN009 até importar |

## Settings sugeridos

```json
{
  "lsp.symbols.scope": "project"
}
```

Ou contexto nomeado (modo misto / isolamento):

```json
{
  "lsp.symbols.scope": "mixed",
  "lsp.contexts": [
    {
      "name": "ops",
      "rootDir": "exemplos/contexto-projeto",
      "filePattern": "*.lsp",
      "includeSubdirectories": false
    }
  ]
}
```
