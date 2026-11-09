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

- `@ ... @` abre e fecha na mesma linha. `@` sem o segundo `@` fica incompleto. Multi-linha → `/* */` (SYN011).
- Toda instrução termina com `;`.
- String `"` aberta deve fechar na linha ou continuar com `\` (SYN012).

**Blocos:** gerar `{ }` (padrão de estilo). `Inicio`/`Fim;` são válidos e equivalem a `{ }`. `FimSe` / `FimEnquanto` não existem (SYN016).

## WebService

```lsp
Definir Pedido.Retorno wsPed;
wsPed.Usuario.CmpUsu = vaUser;
```

Não inventar tipo genérico; o caminho pontuado é o tipo.

## Variáveis de sistema

`CodEmp`, `CodFil`, etc. só como identificador solto. Depois de `.` (ex. `ws.Pedido.CodEmp`) tratam-se como campo.

## Nomenclatura

Prefixo + nome descritivo por extenso (`vnCodigoPedido`). Variável que espelha campo de banco ou variável de sistema mantém o nome do campo: `vnCodEmp`, `vnCodFil`, `vaCodPro`. Não expandir para `vnCodigoEmpresa`.

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
Se (vnA > 0) {
  @ ... @
FimSe;
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
| `Retorna;` (sem parênteses não compila) | `Cancel(1)` após erro |
| `Break` | `Pare` |
| `%` | `RestoDivisao` |
| `\n` | `CaracterParaAlfa(13, vaEnter)` |
| `Chr()` | `CaracterParaAlfa` |
| `Truncar()` | funções de arredondamento documentadas |
| `FimSe` / `FimEnquanto` | `}` (ou `Fim;`) |

`Inicio` / `Fim;` e `Retorna(valor)` são válidos (palavras reservadas do compilador Senior); o padrão de geração continua `{ }` e `Cancel(1)`.

## Exceções (retorno direto)

Algumas funções retornam valor diretamente (ex.: `ArqExiste`, `Abrir`, `CodData`). Na dúvida, consultar documentação oficial ou exemplos do repositório.
