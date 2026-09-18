---
name: lsp-logs
description: Logs LSP com vaMosLog, pasta logs/ e timestamp. Use ao pedir ou precisar de logs para depuração.
---

# lsp-logs

Consulte a rule **`lsp-logs.mdc`**. Abaixo: passos e snippets.

## Quando usar

- Pedido de “criar/adicionar logs”
- Depuração ou rastreamento de fluxo

## Passo a passo

1. Declarar no início: `vaCaminhoLog`, `vnHandleLog` (0), `vnLogAberto` (0), `vaMensagemLog`, `vaMosLog`, auxiliares de data/hora.
2. Caminho em `logs\LOG_NomeRegra.txt` (ou absoluto do workspace).
3. Abrir só se `vaMosLog = "S"`: `Abrir(..., Gravarnl)`; marcar `vnLogAberto = 1`.
4. Escrever com timestamp: `DataHora` → `FormatarData` → concatenar Alfa → `Gravarnl`.
5. Fechar no fim e antes de `Cancel(1)` se o log estiver aberto.

## Snippets

### Declarações

```lsp
@ === SISTEMA DE LOG === @
Definir Alfa vaCaminhoLog;
Definir Numero vnHandleLog; vnHandleLog = 0;
Definir Numero vnLogAberto; vnLogAberto = 0;
Definir Alfa vaMensagemLog;
Definir Alfa vaMosLog; vaMosLog = "S";
Definir Numero vnDataHoraInit;
Definir Alfa vaDataHoraInitStr;
Definir Alfa vaLinhaFlags;
```

### Abrir / escrever / fechar

```lsp
Se (vaMosLog = "S") {
  vaCaminhoLog = "logs\\LOG_NomeRegra.txt";
  vnHandleLog = Abrir(vaCaminhoLog, Gravarnl);
  vnLogAberto = 1;
}

Se ((vaMosLog = "S") e (vnLogAberto = 1)) {
  DataHora(vnDataHoraInit);
  FormatarData(vnDataHoraInit, "dd/MM/yyyy HH:mm:ss", vaDataHoraInitStr);
  vaLinhaFlags = "[" + vaDataHoraInitStr + "] " + vaMensagemLog;
  Gravarnl(vnHandleLog, vaLinhaFlags);
}

Se (vnLogAberto = 1) {
  Fechar(vnHandleLog);
  vnHandleLog = 0;
  vnLogAberto = 0;
}
```

## WebService / funções

Em regras usadas como WebService, handle do fluxo principal pode ser inválido dentro de funções. Abrir/fechar o log **dentro** da função que grava.

## Lembretes

- Concat: só Alfa + Alfa (`IntParaAlfa` para números)
- Erro: `Cancel(1);` — fechar log antes se aberto
