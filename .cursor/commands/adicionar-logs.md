Adicione logs ao código LSP em foco (ou aos arquivos que eu indicar) seguindo o **padrão do projeto**:

1. Consulte a regra **@lsp-logs.mdc** e a skill **lsp-logs**.
2. Use a variável de controle **vaMosLog** ("S" = gera log, "N" = não gera), as variáveis **vaCaminhoLog**, **vnHandleLog**, **vaMensagemLog** e o formato de linha com data/hora **\[dd/MM/yyyy HH:mm:ss\] mensagem**.
3. O arquivo de log deve ser gravado na **pasta logs/ na raiz do projeto**, com nome **LOG_NomeRegra.txt** (ex.: `C:\Dev\LSP - Senior\logs\LOG_NomeRegra.txt`).
4. Implemente abertura condicional (quando vaMosLog = "S"), escrita com **Gravarnl** e fechamento ao final do fluxo (e antes de Cancel em caminhos de erro).
5. Opcional: use as funções auxiliares **abrirArquivoLog**, **escreverArquivoLog** e **fecharArquivoLog** para regras maiores, conforme @lsp-logs.mdc.

Respeite as regras LSP: concatenação apenas Alfa+Alfa (IntParaAlfa para números); Cancel(1) após erro; fechar handle antes de Cancel quando o log estiver aberto.
