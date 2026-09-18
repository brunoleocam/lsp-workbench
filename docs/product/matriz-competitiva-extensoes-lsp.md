# Matriz competitiva — extensões LSP

Data: 2026-09-18  
Fontes (análise local, **sem copiar código**):

| Extensão | Repo | Versão analisada |
|----------|------|------------------|
| **llutti** | [llutti/vscode-language-lsp](https://github.com/llutti/vscode-language-lsp) | 2.0.11 |
| **rodrigokiller** (Killer) | [rodrigokiller/vscode-language-lsp](https://github.com/rodrigokiller/vscode-language-lsp) | 1.0.4 |
| **LSP Workbench** | este monorepo `packages/lsp-workbench` | 0.1.3 |

Legenda: ✅ tem · ⚠️ parcial / reserva · ❌ não tem · ★ diferencial próprio

**Roadmap Workbench (aprovado):** Opção 1 (paridade UX) → Opção 2 (compiler) → Opção 3 (LS/Worker). Ver [ADR-006](adr/ADR-006-roadmap-opcoes-1-2-3.md) e [PDR-004](pdr/PDR-004-paridade-ux.md).

---

## 1. Visão rápida

| Dimensão | llutti | Killer | Workbench |
|----------|--------|--------|-----------|
| Papel | IDE “TS-like” completa | Coloração + snippets | IDE + Agent Demóbile |
| Arquitetura | Compiler package + Language Server + Worker | Só contribs estáticas (sem `main`) | Extensão in-process (providers VS Code) |
| Language id | `lsp` | `lsp` | `senior-lsp` ★ (evita colisão) |
| Extensões arquivo | `.lsp`, `.lspt` | `lsp`, `txt` | `.lsp`, `.lspt` (+ `.txt` via association) |
| Compilador real (lexer/parser/AST) | ✅ | ❌ | ❌ (heurísticas + índice) |
| Catálogos multi-sistema | ✅ SENIOR+HCM+ACESSO+ERP | ⚠️ listas TextMate (ERP/RH misturados) | ⚠️ só SENIOR (~208) |
| Agent / skills / Demóbile | ❌ | ❌ | ✅ ★ |

---

## 2. Matriz de features IDE

| Feature | llutti | Killer | Workbench | Gap Workbench |
|---------|--------|--------|-----------|---------------|
| TextMate colorização | ✅ (~12 KB) | ✅ densa (~37 KB, ~911 funcs) | ✅ básica (~1 KB) | Grammar fraca vs Killer |
| Semantic tokens | ✅ (8 tipos + SQL) | ❌ | ❌ | P0 backlog PDR-003 |
| Snippets | ✅ 32 | ✅ 33 (muito SQL) | ⚠️ 2 (`lista`, `cursor`) | P1 expandir |
| Completion builtins | ✅ multi-sistema | ❌ (só TextMate) | ✅ SENIOR | P1 HCM/ACESSO/ERP |
| Completion Cursor/Lista membros | ✅ 6 + 19 métodos + props + campos | ❌ | ❌ | **P0** |
| Completion custom / cross-file | ✅ | ❌ | ✅ (PDR-003) | — |
| Hover / Signature | ✅ ricos + docUrl | ❌ | ✅ | — |
| Go to Definition | ✅ | ❌ | ✅ | — |
| Outline / DocumentSymbol | ✅ | ❌ | ❌ | P2 |
| Diagnósticos sintáticos | ✅ LSP0001–0007 | ❌ | ✅ SYN* (heurística) | Parser formal = P2 |
| Diagnósticos semânticos Senior | ✅ LSP1xxx (~58 códigos) | ❌ | ✅ SYN/RUL/FUN/SEM/SQL (~50 IDs) | Cobertura diferente ★ |
| Regras de ouro Demóbile | ❌ | ❌ | ✅ RUL* ★ | — |
| Quick Fix import função | ⚠️ QF genéricos | ❌ | ✅ FUN009 ★ | — |
| Contextos multiarquivo | ✅ | ❌ | ✅ | — |
| SingleFile + sistema status bar | ✅ | ❌ | ✅ (catálogo ainda não troca) | P1 ligar catálogo |
| Formatter | ✅ canônico + SQL opt-in | ❌ | ✅ indent/braces | SQL embutido = P1 |
| Refactors wrap/toggle bloco | ✅ | ❌ | ⚠️ via QF SYN004 | P2 refactors dedicados |
| SQL embutido format/highlight | ✅ opt-in | ❌ | ⚠️ settings reserva | P1 |
| Language Server / Worker | ✅ | ❌ | ❌ | P3 (só se escala exigir) |
| i18n (pt/es) | ✅ | ❌ | ❌ | P3 |
| Marketplace | ✅ | ✅ | ❌ (não-objetivo) | — |

---

## 3. Como cada um implementa (modelo mental)

### 3.1 Killer (rodrigokiller)

- **Só** `syntaxes/lsp.tmLanguage.json` + `snippets/lsp.json` + `language-configuration.json`.
- Grammar grande: keywords + listas enormes de funções/vars (cobertura visual alta; qualidade irregular).
- Snippets fortes em **API SQL completa** (`SQL_Criar` … `SQL_Destruir`, `ExecSQL`/`Ex`).
- Não valida nada; não completa semanticamente.

### 3.2 llutti

- **`@lsp/compiler`**: lexer → parser/AST (com recovery) → semantic → diagnostics → format → semantic tokens → symbol index.
- **Extension**: Language Server + **Worker** (`compiler-worker`) para não travar a UI; pull diagnostics estável; contextos; fallback SingleFile.
- Internals JSON por sistema (assinaturas SENIOR ~182, HCM ~198, ACESSO ~4, ERP ~413; vars HCM ~1754).
- Membros Cursor/Lista tipados no compiler; campos Lista via `.AdicionarCampo` no semantic.
- SQL embutido elegível (`ExecSql`, `.SQL`, `SQL_DefinirComando`) com dialetos e no-op seguro.

### 3.3 Workbench (nós)

- Providers VS Code no mesmo processo: completion, hover, signature, def, format, diagnostics, code actions.
- Índice de símbolos próprio (PDR-003) + regras estáticas alinhadas a `docs/lsp` / Demóbile.
- Agent (`lsp-workbench-agent`) + plugin Demóbile (`docs/banco-senior`, `docs/senior`) — **fora do escopo** dos dois concorrentes.
- Sem lexer/parser formal; diagnósticos por regex/heurística (bom para regras de ouro; limitado para AST/Tabela/tipos).

---

## 4. Snippets — detalhe

| Família | llutti (32) | Killer (33) | Workbench (2) |
|---------|-------------|-------------|---------------|
| Blocos / Se / Para / Inicio | ✅ | ✅ | ❌ |
| Definir Alfa/Numero/Data/… | ✅ | ⚠️ (foco funcao) | ❌ |
| Cursor / Lista | ✅ | ❌ | ✅ |
| Tabela | ✅ | ❌ | ❌ |
| SQL_Criar…Destruir / ExecSQL* | ✅ | ✅ forte | ❌ |
| Helpers (CR, string, cor) | ✅ | ⚠️ GeraLog/Mensagem | ❌ |

**Ação:** portar *conceitos* (não código) dos snippets SQL/Definir do Killer/llutti para `snippets/lsp.json`, preferindo estilo Demóbile `{ }` e regras de ouro.

---

## 5. Validador / “compilador”

| Aspecto | llutti | Workbench |
|---------|--------|-----------|
| Pipeline | Lexer + Parser + Semantic | Heurísticas linha-a-linha + índice |
| Códigos | `LSP####` (~58) | `SYN`/`RUL`/`FUN`/`SEM`/`SQL` (~50) |
| Tabela / schema | ✅ LSP1501–1511 | ❌ |
| Unused vars/params | ✅ | ❌ |
| Tipagem atribuição | ✅ | parcial |
| Regras Demóbile (Retorna, params Numero, EstaNulo…) | fraco/ausente | ✅ forte ★ |
| Import Decl+Impl cross-file | — | ✅ FUN009 ★ |

Não compete “copiar o compiler llutti”. Compete **escolher gaps de UX** (membros, semantic tokens, catálogos, SQL) e manter o diferencial Demóbile/Agent.

---

## 6. Prioridade sugerida (pós-matriz)

**Atualização 2026-09-18:** Opção 1 (PDR-004) entregue na extensão **0.2.0**. Opção 2 foundation em `packages/lsp-analyzer`. Opção 3 foundation: `packages/lsp-language-server` (LS+Worker; `lsp.server.enabled` default false).

| Pri | Item | Status |
|-----|------|--------|
| P0 | Membros Cursor/Lista | Feito |
| P0 | Semantic tokens | Feito |
| P1 | Snippets + TextMate | Feito |
| P1 | Catálogos system + SQL format | Feito (stubs HCM/ERP) |
| P2 | Outline + refactors | Feito |
| — | Compiler / LS | Em andamento (foundation / stub) |

---

## 7. O que *não* fazer

- Copiar código, fixtures HR ou JSON de internals do llutti (licença MIT permite fork, mas PDR/ADR deste monorepo pedem implementação própria).
- Tentar “paridade total” com o compiler llutti na mesma sprint.
- Colidir language id `lsp` com Killer/llutti no mesmo workspace — manter `senior-lsp`.

---

## 8. Próximo passo operacional

1. Spec curta P0: membros Cursor/Lista no completion (fonte: `docs/lsp` + fixtures Workbench).  
2. Spec P0: `DocumentSemanticTokensProvider` mínimo ligado ao índice.  
3. Batch P1: snippets + grammar TextMate a partir de listas **nossas** (`function-catalog.generated.ts`).
