# LSP Workbench (extensão)

Versão: **0.2.0** · Language id: **`senior-lsp`**

## Status Opção 1 (PDR-004)

| Área | Estado |
|------|--------|
| Membros Cursor/Lista + campos | Feito |
| Semantic tokens | Feito |
| Snippets (~30) | Feito |
| TextMate + builtins | Feito |
| Catálogos HCM/ACESSO/ERP | Stub + merge SENIOR |
| Format SQL embutido | Opt-in |
| Outline | Feito |
| Refactors | Feito |

Roadmap 2–3: [PDR-005](../../docs/product/pdr/PDR-005-compiler-e-language-server.md) · Analyzer: [`../lsp-analyzer`](../lsp-analyzer) · LS stub: [`../lsp-language-server`](../lsp-language-server)

Arquitetura: [ARCHITECTURE.md](../../docs/product/architecture/ARCHITECTURE.md)

## Dev

```powershell
cd packages/lsp-workbench
npm install
npm test
node ../../scripts/generate-tmgrammar.mjs   # regenerar TextMate após extract-functions
```

F5 na raiz: **Run LSP Workbench Extension**.

## Settings

Ver ADR-003. `lsp.format.embeddedSql.enabled` formata SQL elegível.
