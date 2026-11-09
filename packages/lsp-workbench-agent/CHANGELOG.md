# Changelog — LSP Workbench Agent

## 1.5.0 — 2026-11-09

### Alterado

- `Inicio`/`Fim` são válidos e equivalem a `{ }`; o padrão de geração continua `{ }`. SYN004 e ANL004 revogados ([ADR-008](../../docs/product/adr/ADR-008-aceitar-inicio-fim-e-retorna.md))
- RUL007/ANL010 valem só para `Retorna;`/`Retorne;` sem parênteses; `Retorna(valor)` é válido, mas a geração segue com `Cancel(1);`

### Adicionado

- IDs do compilador Senior em `lsp-compilar` e `docs/ids-estaticos.md`: SYN016, FUN010..FUN014, TYP001..TYP003, SEM005..SEM007

### Compatibilidade

| Agent | Extensão IDE |
|-------|----------------|
| 1.5.0 | ≥ 0.3.0 |

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
