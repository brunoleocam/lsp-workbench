---
description: "Valida��o obrigat�ria ap�s gerar ou alterar c�digo LSP."
applyTo: "**/*.lsp"
---

# LSP � Valida��o obrigat�ria

**OBRIGAT�RIO:** Sempre que gerar ou alterar c�digo LSP (arquivos `.lsp`), executar valida��o antes de dar por encerrado.

## Fluxo obrigat�rio

1. **Antes** de gerar ou alterar `.lsp` em tarefas n�o triviais: seguir a skill **`lsp-gerar`** (mapear t�picos em `docs/lsp/`; se houver SQL/tabelas/campos do Senior, usar **`lsp-banco`**).
2. **Ap�s** escrever ou editar qualquer trecho em `.lsp` ? executar valida��o.
3. **Usar** a skill `lsp-revisar` (ler o SKILL.md e aplicar o checklist).
4. **Ou** usar a skill `lsp-compilar` para valida��o sistem�tica com relat�rio.
5. **Corrigir** todas as viola��es encontradas antes de considerar conclu�do.

## Itens cr�ticos a validar

- Par�metros de fun��o: apenas `Numero`; vari�veis globais para outros tipos.
- **Campos com ponto:** n�o passar `Objeto.Campo` ou `Grid.Campo` em par�metros; usar vari�vel intermedi�ria (ex.: `vnVal = Grid.Campo;` depois `IntParaAlfa(vnVal, vaStr);`).
- Condi��es compostas: cada condi��o entre par�nteses `((a > 0) e (b < 10))`.
- Convers�es em grids: sempre vari�vel intermedi�ria.
- Concatena��o: apenas Alfa + Alfa; nunca em par�metros de fun��es.
- Retorno: fun��es retornam por par�metro, n�o por atribui��o.
- Interrup��o: `Cancel(1);` ap�s erro; nunca `Retorna;` sem par�nteses (n�o compila).
- **ExecSQLEx:** `0 = sucesso`, `1 = erro`; usar `Se (vnRetorno = 0)` para sucesso (n�o inverter).

## Refer�ncias

- Insights de desenvolvimento (WebService, arquivos, grid): `docs/lsp/insights-webservice-desenvolvimento.md`
- Checklist completo: skill `lsp-revisar`
- Valida��o sistem�tica: skill `lsp-compilar`
- Limita��es: `lsp-limites.mdc`, `lsp-nucleo.mdc`
