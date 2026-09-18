# Brand — única pasta de assets do monorepo

Tudo da marca fica **aqui** (`/assets`). Não há `packages/*/assets`.

| Arquivo | Uso |
|---------|-----|
| `icon.png` | Extensão (`packages/lsp-workbench` → `../../assets/icon.png`) |
| `logo.svg` | Agent (`packages/lsp-workbench-agent` → `../../assets/logo.svg`) |
| `brand-source.jpg` | JPG original |

Regenerar a partir do JPG fonte (se necessário):

```powershell
$env:NODE_PATH = "$env:TEMP\lsp-wb-logo\node_modules"
node .\scripts\sync-brand-assets.js
```

**Publish:** ao publicar um pacote sozinho, copie estes arquivos para dentro do artefato (ou publique o monorepo). Em desenvolvimento no monorepo, o caminho relativo já resolve.
