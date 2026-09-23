# Publicar extensão — LSP Workbench (VS Marketplace / Cursor)

Publicar a partir de `packages/lsp-workbench` no repositório **público**  
https://github.com/brunoleocam/lsp-workbench  

**Não** incluir `docs/banco-senior`, `docs/senior` nem `packages/lsp-workbench-demobile`.

## Pré-requisitos

1. Conta publisher `brunoleocam` em https://marketplace.visualstudio.com/manage  
2. Personal Access Token (Azure DevOps) com escopo **Marketplace → Manage**  
3. Node 20+; na raiz do monorepo:

```powershell
cd packages\lsp-analyzer
npm install
npm run compile
cd ..\lsp-workbench
npm install
npm run compile
```

## Empacotar VSIX localmente

```powershell
cd packages\lsp-workbench
npm run package:vsix
```

O script [`scripts/package-extension.mjs`](../../scripts/package-extension.mjs) compila o analyzer, gera um tarball vendored (evita junction `file:` que quebra o `vsce`) e produz `lsp-workbench-<versão>.vsix`.

Instalar para teste: `code --install-extension .\lsp-workbench-0.2.0.vsix`

## Publicar no VS Marketplace

```powershell
cd packages\lsp-workbench
npx @vscode/vsce publish -p <TOKEN>
```

Ou: `npx @vscode/vsce publish` se o token estiver em `VSCE_PAT`.

## Cursor / Open VSX

- Cursor costuma instalar extensões compatíveis com o VS Marketplace (mesmo publisher/id).  
- Opcional Open VSX: `npx ovsx publish lsp-workbench-*.vsix -p <OVSX_TOKEN>`  
- Agent Cursor: ver [../lsp-workbench-agent/PUBLISH.md](../lsp-workbench-agent/PUBLISH.md)

## Language Server

`lsp.server.enabled` continua **false** por padrão. O VSIX embute o analyzer in-process; o pacote `lsp-language-server` **não** vai no VSIX nesta versão (PDR-005).

## Checklist

- [ ] `icon.png` e `LICENSE` dentro de `packages/lsp-workbench`
- [ ] `README.md` voltado ao usuário final (não PDR/dev interno)
- [ ] Prints em `media/` são capturas reais; no README da extensão, URLs **absolutas** (monorepo) — ver `media/README.md`
- [ ] Sem dados de cliente no artefato (`vsce ls` / inspecionar VSIX)
- [ ] Smoke: abrir `.lsp`, diagnostics, completion sem catálogo local
- [ ] Changelog alinhado à versão publicada
