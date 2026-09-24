# Referência – sintaxe e limitações LSP

## Tipos essenciais

```lsp
Definir Alfa vaNome;
Definir Numero vnIdade;
Definir Data vdNascimento;
```

## Comentários e estrutura

```lsp
@ comentário de uma linha @
/* bloco
   multi-linha */
```

- `@ ... @` **só na mesma linha** (SYN011). Multi-linha → `/* */`.
- Toda instrução termina com `;`.
- String `"` aberta deve fechar na linha ou continuar com `\` (SYN012).

**Blocos:** sempre `{ }`. Não usar `Inicio`/`Fim;` / `FimSe` / `FimEnquanto`.

## WebService

```lsp
Definir Pedido.Retorno wsPed;
wsPed.Usuario.CmpUsu = vaUser;
```

Não inventar tipo genérico; o caminho pontuado é o tipo.

## Variáveis de sistema

`CodEmp`, `CodFil`, etc. só como identificador solto. Depois de `.` (ex. `ws.Pedido.CodEmp`) tratam-se como campo.

## Condicional e laço

```lsp
Se (vnValor > 0) {
  Mensagem(Retorna, "ok");
} Senao {
  Mensagem(Retorna, "zero ou negativo");
}

Enquanto (vnContador < 10) {
  vnContador = vnContador + 1;
}
```

Com `e` / `ou`:

```lsp
Se ((vnA > 0) e (vnB < 10)) {
  @ ... @
}
```

## Funções – padrão Senior

Declarações (`Definir Funcao`) ficam no **topo do arquivo**, **depois** das variáveis. Ordem dos tipos: Numero → Alfa → Data → Lista → Tabela → Grid → Cursor → Funcao.

```lsp
@ Declaração (bloco inicial, após variáveis) @
Definir Funcao Somar(Numero pnA, Numero pnB, Numero End pnResultado);

@ Chamada @
Somar(vnA, vnB, vnResultado);

@ Implementação – corpo com { } @
Funcao Somar(Numero pnA, Numero pnB, Numero End pnResultado); {
  pnResultado = pnA + pnB;
}
```

```lsp
@ CORRETO @
TamanhoAlfa(vaTexto, vnTamanho);
EstaNulo(vaDado, vnEhNulo);
Se (vnEhNulo = 0) {
  @ ... @
}

DataHora(vnAgora);
FormatarData(vnAgora, "dd/MM/yyyy", vaData);

IntParaAlfa(vnCodigo, vaCodigo);
vaMsg = "Código: " + vaCodigo;
```

```lsp
@ INCORRETO – não gerar @
vnTamanho = TamanhoAlfa(vaTexto);
Se (EstaNulo(vaDado) = 0);
FormatarData(vdData, "dd/MM/yyyy", vaData);
Mensagem(Retorna, "x" + vnCodigo);
Retorna;
Funcao Foo(...);
Inicio
  @ ... @
Fim;
```

## Interrupção

```lsp
Mensagem(Erro, "Falha na validação");
Cancel(1);
```

## Quebra de linha em strings longas

Use `\` no fim da linha (preferência ~coluna 80), comum em `.SQL` de cursores.

## Nomes de função

- Máximo **30** caracteres
- Evitar dígitos no nome (preferir descrição curta)

## Funções / palavras que NÃO existem (ou diferem)

| Evitar | Usar |
|--------|------|
| `Retorna` | `Cancel(1)` |
| `Break` | `Pare` |
| `%` | `RestoDivisao` |
| `\n` | `CaracterParaAlfa(13, vaEnter)` |
| `Chr()` | `CaracterParaAlfa` |
| `Truncar()` | funções de arredondamento documentadas |
| `Inicio` / `Fim;` | `{` / `}` |

## Exceções (retorno direto)

Algumas funções retornam valor diretamente (ex.: `ArqExiste`, `Abrir`, `CodData`). Na dúvida, consultar documentação oficial ou exemplos do repositório.
