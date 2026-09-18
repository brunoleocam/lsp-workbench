---
name: lsp-banco
description: Ao definir tabelas, colunas, chaves, JOINs, enumerações ou SQL Oracle do ERP Senior, consultar docs/banco-senior antes de responder ou gerar LSP. Usar em toda menção a E*/R*/USU_* ou campos CODEMP, NUMPED, etc.
---

# Consulta ao modelo de dados – docs/banco-senior

**Obrigatório** sempre que a tarefa envolver:

- Nome de **tabela** (ex.: `E120PED`, `E140IPV`, `USU_*`, `R996*`),
- **Colunas**, tipos, chaves primárias/estrangeiras,
- **JOINs**, filtros por empresa/filial/pedido/NF/título,
- **Enumerações** / listas de valores de campo,
- **SQL** (SELECT/INSERT/UPDATE) contra o Oracle do Senior em contexto LSP.

**Ferramenta/MCP:** nenhuma — evidência nos arquivos do repositório `docs/banco-senior/`.

## Ordem de leitura (mínimo útil)

1. **`docs/banco-senior/README.md`** — visão da pasta e links.
2. Conforme a dúvida:
   - **Convenção de nomes / prefixos:** `docs/banco-senior/convencoes-nomenclatura.md`
   - **Fluxo de negócio (pedido → NF → título, etc.):** `docs/banco-senior/dominios-fluxos.md`
   - **Tabelas mais usadas e colunas típicas:** `docs/banco-senior/tabelas-principais.md`
   - **CODEMP, CODFIL, NUMPED, NUMNFV, exemplos de JOIN:** `docs/banco-senior/chaves-relacionamentos.md`
   - **Trechos de SQL homologados por domínio:** `docs/banco-senior/exemplos-por-dominio.md`
   - **NVL, datas, `sys_context`, placeholders LSP `:vn`:** `docs/banco-senior/sintaxe-oracle-senior.md`
   - **Enumerações / listas:** `docs/banco-senior/dicionario-dados/dominios-enumeracoes-r996lsf.md` e `dominios-enumeracoes-r996lsf-r998lsf.md`
3. **Uma tabela específica:** `docs/banco-senior/dicionario-dados/tabelas/<NOME_TABELA>.md`  
   - Título `# CODIGO – Descrição` é a descrição canônica (alinhado à regra `documentacao-veracidade.mdc`).
   - Relacionamentos LNK e enums do campo, quando presentes no mesmo arquivo.

## Integração com LSP

- Regra do projeto: **`lsp-banco-senior.mdc`** (placeholders, CODEMP/CODFIL, boas práticas).
- Documentação de **funções SQL/cursor na linguagem:** `docs/lsp/sql.md`, `docs/lsp/cursores.md`.
- Geração completa de `.lsp`: usar antes o **`lsp-gerar`**.

## O que não fazer

- Inventar coluna, tipo ou valor de enum sem abrir o `.md` da tabela (ou enums / exemplos homologados).
- Descrever finalidade de tabela ERP sem bater com o título do arquivo em `dicionario-dados/tabelas/`.

## Se o arquivo da tabela não existir

Dizer explicitamente que não há entrada no dicionário local; não preencher lacuna com suposição — pedir confirmação ou outra fonte homologada.
