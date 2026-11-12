# EVAL — Extensão LSP Workbench

## Fixtures (smoke real)

Pasta: `packages/lsp-workbench/fixtures/`  
Manifesto: [`MANIFEST.json`](../../../packages/lsp-workbench/fixtures/MANIFEST.json)  
Guia F5: [`fixtures/README.md`](../../../packages/lsp-workbench/fixtures/README.md)

| Fixture | Expectativa |
|---------|-------------|
| `00-ok-clean.lsp` | 0 diagnósticos |
| `smoke-syn.lsp` | SYN001–010 (+ RUL008) |
| `smoke-rul.lsp` | RUL001–019 (exceto RUL008) |
| `smoke-fun.lsp` | FUN001–006 |
| `smoke-fun-pdr003.lsp` | FUN007–009 |
| `smoke-sem.lsp` | SEM001–003 |
| `smoke-sem004.lsp` | SEM004 |
| `smoke-sql.lsp` | SQL001–011 |
| `smoke-ger.lsp` / `smoke-ger-pre.lsp` | GER001–004 |
| `format-if.lsp` | Format Document (golden manual) |

## Runner

```powershell
cd packages\lsp-workbench
npm test
```

O suite `smoke fixtures (MANIFEST)` falha se algum `expectIds` não aparecer ou se faltar cobertura de `IMPLEMENTED_RULE_IDS`.

## Smoke manual (F5)

1. Run and Debug → **Run LSP Workbench Extension**
2. Abrir cada `smoke-*.lsp` na pasta fixtures
3. Conferir Problems com IDs `[…]`
4. Quick Fix em RUL007 (`Retorna;`) / RUL014 / FUN001 (SYN004 revogado, ADR-008)
5. Compilação (PDR-012, etapa 1):
   - F9 num `.lsp` mostra notificação `LSP: N erros, M avisos` (AC-010)
   - Com `lsp.compileOnSave` ligado, salvar revalida na hora; desligado, só a digitação revalida (AC-011)
   - Status bar à esquerda mostra `$(error) N $(warning) M` do arquivo ativo; some ao trocar para arquivo não-LSP; clique abre Problemas (AC-012)
6. Dicionário de dados (PDR-012, etapa 6a, AC-065), com catálogo local carregado:
   - Ctrl+Alt+D e o botão de banco no título do editor abrem a lista de tabelas; não aparecem fora de `.lsp`
   - Digitar `cliente` filtra pela descrição; com o cursor sobre `E085CLI` a lista já vem filtrada
   - Escolher um campo insere `TABELA.CAMPO` no cursor; o primeiro item insere só a tabela
   - Sem catálogo, aviso pedindo `lsp.catalog.path`
7. `.LSP` binário (PDR-012, etapa 7), com uma regra exportada do Senior (ex.: `docs/senior/regras-binarias/SARG462.LSP`):
   - Clicar no Explorer abre a aba `SARG462.LSP` com o texto da regra (acentos corretos), linguagem Senior LSP; a aba binária some (AC-070)
   - Problemas mostra diagnósticos do documento aberto e o completion funciona como num `.lsp` texto; nenhum diagnóstico fica preso ao arquivo `file:` (AC-073)
   - Editar e salvar cria `SARG462.editado.LSP` na mesma pasta; o original continua com o mesmo tamanho e data (AC-071)
   - Digitar `→` e salvar mostra erro com o caractere e a linha e não grava; `€` grava (AC-072)
   - Fechar e reabrir `SARG462.LSP` mostra o texto editado e o aviso "Abrindo a cópia editada SARG462.editado.LSP; o original não foi alterado" (AC-074)
   - Com `lsp.binary.autoOpen` desligado, o clique mostra o arquivo como binário; botão direito → "Abrir regra .LSP binária" abre a regra (AC-070)
8. Gerar `.LSP` a partir de texto (PDR-012, etapa 8), num `.lsp` texto salvo (ex.: `minha-regra.lsp`):
   - O botão de pacote no título do editor (ou a paleta) pede o título, com o nome do arquivo como padrão; título vazio, com mais de 70 caracteres ou com `→` é recusado no campo (AC-083)
   - Com erro de compilação, aparece o modal "A regra tem N erro(s)…"; Cancelar não grava nada (AC-082)
   - "Salvar como" já sugere `MINHA-REGRA.senior.LSP` na pasta do texto; após gravar, "Abrir" mostra a regra no esquema binário com o mesmo texto (AC-080)
   - Importar o `.senior.LSP` no Senior e conferir título e fonte (AC-081, validação real do formato)
   - Num documento já aberto como `.LSP` binário, o comando avisa que ele já está no formato do Senior (AC-083)
   - Um arquivo `.lsptxt` abre com a linguagem Senior LSP (AC-084)

Relatório: use o comando **Gerar Relatório** (não há árvore demo versionada).

## Paridade UX

Checklist e fixtures: [`EVAL-paridade-ux.md`](EVAL-paridade-ux.md) (PDR-004).
