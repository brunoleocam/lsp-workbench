# Changelog — LSP Workbench Agent

## 1.4.2 — 2026-09-28

### Adicionado

- Command `/configurar-workspace`, apontando para **LSP Workbench: Configurar este Workspace**
- IDs **SYN013** (marcador de snippet), **SYN014** e **SYN015** (`ConverteMascara`)

### Alterado

- **RUL005**: `Objeto.Campo` só é erro quando a documentação do parâmetro não diz Campo/Variável
- Skills e rules alinhadas à extensão **0.2.13**

### Compatibilidade

| Agent | Extensão IDE |
|-------|----------------|
| 1.4.2 | ≥ 0.2.13 |

## 1.4.1 — 2026-09-24

### Corrigido

- `marketplace.json` alinhado ao schema oficial Cursor (`source` com path completo; removidos campos inválidos no entry)
- `plugin.json`: `category` / `tags`; versão 1.4.1

### Adicionado

- `docs/ids-estaticos.md` — IDs SYN/RUL/ANL/DEM/GER usáveis sem depender de paths do monorepo
- Skills alinhadas à extensão **≥ 0.2.4**: catálogo builtins HCM/ERP, `system` no contexto, SYN011/012, WebService `Definir caminho.pontuado`

### Compatibilidade

| Agent | Extensão IDE |
|-------|----------------|
| 1.4.1 | ≥ 0.2.4 |
