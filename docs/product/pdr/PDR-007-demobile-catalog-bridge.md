# PDR-007 — Bridge Demóbile → catálogos IDE

| Campo | Valor |
|-------|-------|
| Status | Aceito — **P0/P1 parcial** (commands + script catálogo + setting/completion) |
| Data | 2026-09-18 |
| Artefato | Plugin `packages/lsp-workbench-demobile` (gitignored) + extensão (consumidor público do **índice gerado**) |
| Pré-requisito | PDR-004 (contextos/system); docs locais `docs/banco-senior`, `docs/senior` |
| Relacionados | ADR-001, ADR-004, PDR-003, skill `lsp-banco` / `lsp-demobile` |

## Problema

A IDE pública não conhece tabelas/campos/enums Demóbile (não podem ir no remoto público). O plugin tem os docs, mas não alimenta completion/diagnostics da extensão nem tem commands Cursor.

## Decisão

1. **Gerar** um índice JSON **local** (gitignored) a partir de `docs/banco-senior` (e opcionalmente referências em `docs/senior`).
2. A extensão **consome** esse índice se existir no workspace (path configurável), sem embutir dados privados no VSIX/repo público.
3. Plugin ganha **commands** Cursor para consulta/fluxo/geração com banco.

## Levas

| Leva | Entrega | Aceite |
|------|---------|--------|
| **P0** | Commands no plugin: `/consultar-tabela`, `/fluxo-regra` (ou equivalentes) apontando skills | Pasta `commands/` não vazia; smoke LOCAL-TEST | **Feito** (+ `/gerar-com-banco`) |
| **P0b** | Pipeline skill: gerar regra → checklist Demóbile (schema) → sugerir `@lsp-validar` / analyzer | Doc de fluxo em `lsp-demobile` | **Feito** |
| **P1** | Script `scripts/build-demobile-catalog.ps1` (ou `.mjs`) → `docs/banco-senior/.generated/catalog.json` (gitignored) | Arquivo gerado com tabelas/campos amostra | **Feito** (`.mjs`, 3k+ tabelas) |
| **P1b** | Extensão: setting `lsp.demobile.catalogPath` + merge no completion de identificadores SQL/tabela quando o arquivo existir | Sem arquivo → no-op; com arquivo → sugere `E120PED` etc. | **Feito** |
| **P2** | Diagnóstico opcional **DEM001**: identificador parece tabela Senior mas não está no catálogo local | Só se catalogPath ativo | Pendente |

## Não-objetivos

- Commitar `docs/banco-senior` ou o JSON gerado no remoto público
- Expor regras `.lsp` de cliente no Agent público
- Substituir `docs/senior` por completion (regras continuam no plugin/Agent privado)

## Segurança

- `.gitignore` cobre fonte e artefato gerado
- README público descreve só o *contrato* do JSON (schema), sem dados
- ADR-004 permanece: plugin só local

## Disciplina

- Schema do catálogo documentado em `docs/product/demobile-private.md` (sem dados)
- CHANGELOG extensão só menciona a setting, não tabelas internas
