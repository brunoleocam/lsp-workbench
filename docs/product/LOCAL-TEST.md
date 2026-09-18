# Teste local — LSP Workbench

Checklist rápido. Não precisa de Marketplace.

## 0. Pré-requisitos

- Cursor instalado
- Node.js 20+ (para a extensão)
- Esta pasta aberta como workspace

## Autocomplete

Só o catálogo LSP Workbench (`Se`, `Cancel(1);`, `Definir`, …).  
Cursor Tab / sugestões em inglês-espanhol ficam desligados para `senior-lsp` via:

- `cursor.cpp.disabledLanguages`: `["senior-lsp"]` (`.vscode/settings.json`)
- `editor.inlineSuggest.enabled`: false
- `editor.wordBasedSuggestions`: off

Language id: **`senior-lsp`**.

## 1. Extensão (`packages/lsp-workbench`) — **0.2.0**

```powershell
cd packages\lsp-workbench
npm install
npm test
```

Esperado: testes passando (fixtures via `MANIFEST.json` + catálogo de funções docs/lsp).

Features cobertas: PDR-003 (símbolos/contextos) + PDR-004 (membros, tokens, snippets, TextMate, Outline, refactors, SQL format opt-in) + merge **ANL*** do analyzer.

Para carregar no Cursor/VS Code (UI):

1. Abra a **raiz do monorepo** neste workspace
2. Compile analyzer + extensão:
   ```powershell
   cd packages\lsp-analyzer; npm install; npm run compile
   cd ..\lsp-workbench; npm run compile
   ```
3. Painel **Run and Debug** → **Run LSP Workbench Extension** → F5
4. Confira: colorização, Problems (`fixtures/smoke-*.lsp`), Format, Quick Fix, Outline, semantic tokens
5. Smoke negativo: `fixtures/00-ok-clean.lsp` → Problems vazio

### Language Server (opt-in)

```powershell
cd packages\lsp-language-server
npm install
npm test
```

Settings: `lsp.server.enabled` = `true` → Reload Window. Diagnostics ANL* com source `LSP Analyzer`.

## 2. Agent público (`packages/lsp-workbench-agent`)

```powershell
$src = "c:\Dev\Documentacao-LSP-Linguagem-Senior-de-Programacao\packages\lsp-workbench-agent"
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Depois: **Developer: Reload Window**.

Smoke:

- `/gerar-lista-lsp` → campos `CODIGO:Numero, NOME:Alfa`
- `/validar-lsp` em um `.lsp` com `Retorna;`
- `@lsp-linguagem` em dúvida de sintaxe

Harness em `.cursor/` do monorepo já espelha skills/commands.

Próximo: [PDR-006](pdr/PDR-006-agent-analyzer.md) — validar via analyzer.

## 3. Plugin Demóbile (privado)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-demobile-plugin.ps1
```

Reload Window. No Agent: `@lsp-demobile` e pergunta sobre tabela `E120PED` (deve apontar `docs/banco-senior`).

Próximo: [PDR-007](pdr/PDR-007-demobile-catalog-bridge.md).

## 4. Gitignore (sanity)

```powershell
git status
```

**Não** versionar: `docs/banco-senior/`, `docs/senior/`, `packages/lsp-workbench-demobile/`, `node_modules/`.

## 5. Eval manual Agent

Seguir [`eval/EVAL-agent.md`](eval/EVAL-agent.md).

### Setup `.txt` de regra (workspace)

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp"
  },
  "lsp.symbols.scope": "project"
}
```
