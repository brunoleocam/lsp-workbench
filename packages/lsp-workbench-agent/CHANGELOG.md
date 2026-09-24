# Changelog — LSP Workbench Agent

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
