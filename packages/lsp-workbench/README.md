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

Roadmap 2–3: [PDR-005](../../docs/product/pdr/PDR-005-compiler-e-language-server.md) · Analyzer: [`../lsp-analyzer`](../lsp-analyzer) · LS: [`../lsp-language-server`](../lsp-language-server)

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

### Language Server (Opção 3, opt-in)

Default: `lsp.server.enabled` = **false** (diagnósticos in-process, estável).

Para experimentar o LS + Worker:

1. Compile o analyzer e o server:
   ```powershell
   cd packages/lsp-analyzer && npm install && npm run compile
   cd ../lsp-language-server && npm install && npm test
   ```
2. Na extensão: Settings → `lsp.server.enabled` = `true`.
3. **Reload Window**.

Diagnósticos do analyzer passam a ter source `LSP Analyzer`. Format/completion rica/etc. continuam in-process nesta fundação.
