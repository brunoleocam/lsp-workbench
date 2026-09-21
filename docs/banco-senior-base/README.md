# Catálogo Senior — local (PDR-009)

A extensão usa um `catalog.json` **local** para completion `Tabela.Campo` e DEM001.  
O dicionário completo **não** é publicado no GitHub (mesmo o padrão Senior: reduz superfície para abuso / mapeamento de schema).

No repositório público fica só o **exemplo** de contrato JSON + scripts para você gerar o seu.

## Artefatos nesta pasta

| Arquivo | Git | Papel |
|---------|-----|--------|
| [`catalog.example.json`](catalog.example.json) | público | Contrato mínimo (2 tabelas fictícias de exemplo) |
| [`consultar-dicionario.sql`](consultar-dicionario.sql) | público | Queries R996 / R998 |
| `catalog.json` | **gitignore** | Seu catálogo completo (gerado localmente) |
| `tabelas-principais.md` | opcional | Notas humanas |

## Como gerar o seu `catalog.json`

### Opção A — direto do banco (recomendado para quem usa a extensão)

1. Rode o [consultar-dicionario.sql](consultar-dicionario.sql) (Bloco 1 = padrão R996).
2. Exporte o resultado em TSV (com header).
3. Na raiz do monorepo:

```powershell
node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json
```

Personalizados (`USU_*` / R998), se quiser no mesmo JSON (ou no overlay markdown):

```powershell
node scripts/catalog-from-r996-tsv.mjs --in r998.tsv --merge docs/banco-senior-base/catalog.json --keep-usu
```

Por padrão o script **exclui** tabelas e campos `USU_*` (bom para “base”). Use `--keep-usu` no merge do overlay.

### Opção B — a partir do dicionário markdown privado

Se você já mantém `docs/banco-senior/dicionario-dados/tabelas/*.md` (gitignore):

```powershell
node scripts/export-banco-senior-base.mjs
```

## Build merge (base + overlay)

```powershell
node scripts/build-local-catalog.mjs
```

Ordem:

1. `docs/banco-senior-base/catalog.json` (local)
2. `docs/banco-senior/` markdown (overlay do cliente), se existir

Saída gitignored: `docs/banco-senior/.generated/catalog.json` (ou base `.generated/`).

## Layout

```text
banco-senior-base/
  README.md
  catalog.example.json      # versionado
  consultar-dicionario.sql  # versionado
  catalog.json              # local (gitignore)
  tabelas-principais.md     # opcional
```
