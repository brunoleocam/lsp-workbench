# PDR-009 — Catálogo Senior base + overlay de cliente

| Campo | Valor |
|-------|-------|
| Status | Aceito — P0 (revisado: base **não** publicada no git) |
| Data | 2026-09-21 |
| Relacionados | [PDR-007](PDR-007-catalogo-local-bridge.md), [ADR-001](../adr/ADR-001-monorepo-tres-artefatos.md), PDR-001 |

## Problema

A extensão LSP Workbench será distribuída publicamente (VSIX / Marketplace). O dicionário Demobile (`docs/banco-senior/`, campos/tabelas `USU_*` e personalizações) **não** pode ir no artefato público. Publicar o dicionário **padrão** Senior completo (todas as tabelas/campos) também é indesejável: facilita mapeamento de schema por terceiros.

Outras empresas precisam de completion de tabelas/campos com o **seu** dicionário (padrão + customizados), gerado a partir do banco delas.

## Decisão

Três camadas:

| Camada | Pasta / artefato | Git | Conteúdo |
|--------|------------------|-----|----------|
| Extensão | VSIX | público | Sem dicionário embutido |
| **Contrato / receitas** | `docs/banco-senior-base/` (`catalog.example.json`, SQL, README) | **público** | Exemplo de schema JSON + como extrair R996/R998 |
| **Base local** | `docs/banco-senior-base/catalog.json` | **gitignore** | Tabelas/campos padrão gerados pelo usuário |
| **Overlay** | `docs/banco-senior/` | **gitignore** | Personalizações do cliente (Demobile ou outra empresa) |

Geração da base local (TSV do banco → JSON):

```bash
# Ver docs/banco-senior-base/consultar-dicionario.sql
node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json
```

Alternativa (markdown privado já existente):

```bash
node scripts/export-banco-senior-base.mjs
```

O script [`scripts/build-local-catalog.mjs`](../../../scripts/build-local-catalog.mjs):

1. Lê a **base** (`catalog.json` se existir).
2. Lê o **overlay** (se existir) e **mescla** (colunas unidas; overlay pode enriquecer descrição).
3. Escreve `catalog.json` em `.generated/` (gitignored).
4. Falha só se **nenhuma** das duas pastas/fontes existir.

A extensão resolve o catálogo nesta ordem:

1. `lsp.catalog.path` (se configurado; alias deprecado: `lsp.demobile.catalogPath`)
2. `docs/banco-senior/.generated/catalog.json` (overlay gerado)
3. `docs/banco-senior-base/.generated/catalog.json` (só base)
4. `docs/banco-senior-base/catalog.json` (base local)

Sem arquivo → completion/DEM001 no-op (comportamento PDR-007).

## Fluxo por persona

### Mantenedor com overlay de cliente

- Mantém overlay privado em `docs/banco-senior/` (como hoje).
- Gera `docs/banco-senior-base/catalog.json` local (não commit no repo público).
- `node scripts/build-local-catalog.mjs` → merge base + overlay.

### Outra empresa

1. Instala o VSIX.
2. Extrai R996 (e R998 se quiser) com o SQL do starter; gera `catalog.json` local.
3. Opcionalmente cria `docs/banco-senior/` com extras / `USU_*`.
4. Aponta `lsp.catalog.path` se o JSON estiver noutro path.

### Usuário sem dicionário

- Extensão funciona (LSP, GER*, scaffold). Sem completion de `Tabela.Campo`.

## Contrato do merge

- Chave de tabela: nome upper-case.
- Colunas: união por nome; duplicata ignorada.
- `source` no JSON: lista das pastas/arquivos efetivamente lidos.
- Overlay **não remove** tabelas da base; só acrescenta/enriquece.

## Critérios de aceite

| ID | Critério |
|----|----------|
| CAT-01 | Repo público **não** versiona `catalog.json` completo; só `catalog.example.json` |
| CAT-02 | Script TSV→JSON gera `catalog.json` local a partir de R996 |
| CAT-03 | Build base+overlay une tabelas/colunas |
| CAT-04 | Extensão encontra catalog da base se overlay ausente |
| CAT-05 | `docs/banco-senior/` permanece gitignored |

## Fora de escopo (esta leva)

- Publicar dump completo do dicionário padrão Senior
- Marketplace de catálogos por sistema (HCM/ERP) — backlog PDR-001
- Alterar semântica DEM001 para ignorar `USU_*` ausentes
