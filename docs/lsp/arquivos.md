# Manipulação de Arquivos

A LSP permite a manipulação de arquivos utilizando comandos específicos para abrir, ler, gravar e fechar arquivos.

### Abrir (Open)

Abre o arquivo informado em nome do arquivo para o modo de abertura informado (Ler/Gravar). Se o arquivo não existir, ele é criado. Ele retorna um manipulador de arquivos.

**Sintaxe:**

```lsp
Abrir ("<nome do arquivo>",<modo de abertura>);
```

**Exemplo:**

```lsp
arq = Abrir("Teste.txt", Ler);
```

### Ler (Read)

Lê uma quantidade de caracteres especificados em tamanho do arquivo especificado no manipulador de arquivo e joga o valor lido na variável especificada.

**Sintaxe:**

```lsp
Ler(<manipulador de arquivo>,<variável>,<tamanho>);
```

**Exemplo:**

```lsp
Ler(arq, S, 20);
```

### Lernl (ReadLn)

Lê uma linha do arquivo indicado pelo manipulador de arquivo e joga o valor lido para a variável indicada.

**Sintaxe:**

```lsp
Lernl(<manipulador de arquivo>,<variável>);
```

**Exemplo:**

```lsp
Lernl(arq, S);
```

### Gravar (Write)

Grava o valor de uma constante ou de uma variável, e uma quantidade de caracteres especificados em tamanho no arquivo especificado no manipulador de arquivo.

**Sintaxe:**

```lsp
Gravar(<manipulador de arquivo>,<<variável> ou <constante>>,<tamanho>);
```

**Exemplo:**

```lsp
Gravar(arq, S, 20);
```

### Gravarnl (WriteLn)

Grava uma linha no arquivo indicado pelo manipulador de arquivo com o valor de uma variável ou constante, passada como parâmetro.

**Sintaxe:**

```lsp
Gravarnl(<manipulador de arquivo>,<<variável> ou <constante>>);
```

**Exemplo:**

```lsp
Gravarnl(arq, Str);
```

### Fechar (Close)

Fecha um arquivo aberto anteriormente pelo comando Abrir.

**Sintaxe:**

```lsp
Fechar (<manipulador do arquivo>);
```

**Exemplo:**

```lsp
Fechar(arq);
```
