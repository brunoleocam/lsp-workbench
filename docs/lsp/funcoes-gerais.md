# Funções Gerais

As funções gerais na LSP são utilizadas para realizar operações comuns, como manipulação de strings, datas e números.

| Nome                        | Descrição                                                                 |
|-----------------------------|---------------------------------------------------------------------------|
| AlfaParaInt                 | Converte um número armazenado como Alfa e o retorna como um tipo Número.  |
| StrParaInt                  | Converte um valor alfanumérico (string) para o tipo Inteiro. Equivalente a AlfaParaInt.|
| ArqExiste                   | Verifica se um arquivo físico existe no local especificado.               |
| AtualizaBarraProgresso      | Atualiza as mensagens apresentadas na tela da barra de progresso.         |
| CaracterParaAlfa            | Converte um caracter (que fica armazenado pelo código ASCII) para o valor Alfanumérico correspondente. |
| CodData                     | Possibilita a composição de uma data, montando-a através de dia, mês e ano.|
| DesMontaData                | Desmonta uma data, separando em três variáveis, as informações Dia/Mês/Ano da data. |
| ConverteDataBanco           | Converte uma data qualquer, para o formato de data do banco de dados. |
| ConverteDataSqlSenior2      | Converte datas para o formato SQL Senior 2. |
| ConverteDataToDB            | Converte uma data qualquer, para o formato de data do banco de dados. |
| AnoBissexto                 | Retorna a informação se um ano é ou não bissexto tomando como base o ano da data passada. |
| ConverteCodificacaoString   | Esta função converte a codificação de um texto para o formato definido pelo usuário. |
| ConverteMascara             | Esta função converte um valor de entrada (numérico, data, hora ou cadeia de caracteres), para o tipo de dado cadeia de caracteres. |
| ConverteParaMaiusculo       | Converte o conteúdo de uma variável do tipo Alfa para maiúsculo.          |
| ConverteParaMinusculo       | Converte o conteúdo de uma variável do tipo Alfa para minúsculo.          |
| ConverteTexto               | Substitui os caracteres especiais informados no texto de acordo com a codificação do padrão informada, retorna em uma nova variável o texto convertido. |
| CopiarAlfa                  | Esta função copia parte do conteúdo de uma variável/campo alfanumérico para a variável alfanumérica Retorno. |
| CriarArquivoTemporario      | Cria um arquivo temporário de nome aleatório e único prefixado com o valor do parâmetro prefixo. |
| DataHoje                    | Retorna a data atual do sistema operacional.                              |
| DataHora                    | Retorna data e hora atual como número fracionário.                        |
| DecodData                   | Permite a separação de uma data em dia, mês e ano para que os dados possam ser usados separadamente. |
| DeletarAlfa                 | Esta função apaga uma determinada quantidade de caracteres de uma variável/campo a partir da posição informada. |
| DeletarStr                  | Elimina parte de um texto a partir de uma posição específica. |
| InserirAlfa                 | Insere um ou mais caracteres em uma variável/campo, a partir da posição indicada. |
| InserirStr                  | Insere um ou mais caracteres em uma variável/campo, a partir da posição indicada. |
| LimpaEspacos                | Limpa os espaços em branco à direita e à esquerda de uma variável alfanumérica. |
| LimpaEspacosDireita         | Limpa os espaços em branco à direita de uma variável alfanumérica. |
| LimpaEspacosEsquerda        | Limpa os espaços em branco à esquerda de uma variável alfanumérica. |
| QuebraTexto                 | Quebra texto em linhas conforme o tamanho especificado. |
| ProcuraEnter                | Procura caracteres de quebra de linha (#13 ou #10) em uma string. |
| CalculaAlfa                 | Realiza operações matemáticas com valores alfanuméricos. |
| CarregarTextoArq            | Carrega o conteúdo de um arquivo texto para uma variável alfanumérica. |
| Concatena                   | Concatena até 3 campo/variáveis tipo alfa, formando uma só variável. |
| Desencriptar                | Função para descriptografar uma cadeia de caracteres.                     |
| Dividir                     | Função disponível para dividir um valor por outro.                        |
| Encriptar                   | Criptografa a cadeia de caracteres.                                       |
| ExcluirArquivoTemporario    | Exclui um arquivo criado pela função CriarArquivoTemporario.              |
| ExecProg                    | Permite a execução de aplicativos durante a execução de regras.           |
| Extenso                     | Gera o extenso de um valor. |
| ExtensoMes                  | Monta o extenso do mês de uma determinada data. |
| ExtensoMoeda                | Gera o extenso de um valor com a moeda informada. |
| ExtensoSemana               | Monta o extenso do dia da semana de uma determinada data. |
| DataExtenso                 | Gera o extenso de determinada data. |
| FormatarData                | Formata a data.                                                           |
| GeraHash                    | Retorna um Hash do texto informado.                                       |
| GerarNonce                  | Gera o valor do campo Nonce, um número aleatório.                         |
| GerarPwdDigest              | Gera o Digest da senha, a partir do Nonce, Data e senha, em formato base64.|
| GeraSenha                   | Retorna uma sequência de caracteres alfanuméricos aleatoriamente.         |
| GeraToken                   | Retorna um token criptografado.                                           |
| MultiplicaValor             | Multiplica um número no formato alfanumérico por um fator de multiplicação numérico. |
| ConverteUnidadeMedida       | Calcula a quantidade convertida de uma unidade de medida (de) para outra unidade de medida (para). |
| Arredonda                   | Arredonda um valor, conforme a precisão informada. |
| ArredondaABNT               | Aplica a regra de arredondamento da ABNT, conforme a precisão informada. |
| ArredondarValor             | Arredonda determinado valor, conforme a precisão informada. |
| Arredonda Valor Tipo Acerto | Arredonda um valor tipo acerto, conforme a precisão informada. |
| Formatar                    | Formata números de acordo com os parâmetros definidos (formato Delphi). |
| FormatarN                   | Formata números com casas decimais de acordo com os parâmetros definidos (formato Delphi). |
| HoraParaMinuto              | Converte em minutos os valores que representam hora e minuto.             |
| IniciaBarraProgresso        | Inicia a barra de progresso utilizada para mostrar ao usuário o andamento de um processo mais extenso. |
| OcultaBarraProgressoRelatorio | Oculta a barra de progresso padrão durante a execução de relatórios.    |
| FinalizaBarraProgresso      | Finaliza a tela de barra de progresso.                                    |
| IntParaAlfa                 | Converte um número para formato alfanumérico, desprezando as casas decimais.|
| IntParaStr                  | Converte um valor inteiro para o tipo String (Alfanumérico). Equivalente a IntParaAlfa.|
| LerPosicaoAlfa              | Identifica qual caracter está em determinada posição do campo/variável de origem. |
| LinhasArquivo               | Leitura da quantidade de linhas existentes em um determinado arquivo.     |
| ListaItem                   | Retorna o valor de um item de uma lista de valores concatenados por um caracter separador. |
| ListaQuantidade             | Retorna a quantidade de itens de uma lista de valores concatenados por um caracter separador em um texto. |
| Mensagem                    | Apresenta a mensagem em tela de acordo com a parametrização do tipo de retorno e da mensagem que será visualizada. |
| MontaAbrangencia            | Função utilizada para retornar uma cláusula SQL de acordo com um campo e uma abrangência de valores. |
| ObtemIdiomaAtivo            | Retorna o código do idioma utilizado pelo usuário.                        |
| ObterVersaoSistema          | Esta função retorna a versão do sistema.                                  |
| PosicaoAlfa                 | Procura por uma parte de texto dentro de um campo/variável do tipo Alfa, retornando a posição em que o texto inicia. |
| RemoveExpressoesProibidas   | Não permite que campos de relatórios/regras aceitem algum tipo de script. |
| RestoDivisao                | Retorna o resto da divisão de um número por outro.                        |
| RetornaValorCFG             | Responsável por retornar para a regra o valor de uma determinada chave da Central de Configuração Senior que está sendo utilizada pelo sistema. |
| TamanhoAlfa                 | Verifica o tamanho do campo Alfa especificado em Origem.                  |
| TrocaString                 | Procura por um trecho específico dentro de um texto e o substitui, retornando um novo texto. |
| Truncar                     | Trunca um número para inteiro, removendo a parte fracionária do número.   |
| VerificaAbaAtiva            | Verifica, pela descrição passada por parâmetro, se essa é a descrição da aba ativa. |
| VrfAbrA                     | Verifica se um determinado valor está contido em uma abrangência especificada. |
| VrfAbrN                     | Verifica se um determinado valor numérico está contido em uma abrangência especificada. |
| sleep                       | Pausa a execução do código por X milesegundos |
| **Manipulação Dinâmica de Variáveis** | |
| PegarTipoVar                | Retorna o tipo de uma variável qualquer, passada como string. |
| PegarValorVarAlf            | Retorna o valor de uma variável alfanumérica identificada por nome. |
| PegarValorVarNum            | Retorna o valor de uma variável numérica ou de data identificada por nome. |
| SetarValorVarAlf            | Define o valor de uma variável alfanumérica identificada por nome. |
| SetarValorVarNum            | Define o valor de uma variável numérica ou de data identificada por nome. |
| **Verificação e Limpeza** | |
| EstaNulo                    | Verifica se uma variável está nula (vazia ou não inicializada). |
| DeixaNumeros                | Remove todos os caracteres não numéricos de uma string. |
| **Funções de Lista de Regras** | |
| ListaRegraCriarLista        | Cria uma nova lista de regras para armazenar dados estruturados. |
| ListaRegraCarregarJson      | Carrega dados de uma estrutura JSON diretamente em uma lista de regras. |
| ListaRegraPrimeiro          | Posiciona a lista no primeiro registro. |
| ListaRegraProximo           | Move para o próximo registro da lista. |
| ListaRegraObterValorAlfa    | Obtém o valor de um campo específico do registro atual da lista. |
| **Arrays** | |
| LimpaGerTabAlf              | Limpa o conteúdo do Registro GerTabAlf. |
| LimpaGerTabNum              | Limpa o conteúdo do Registro GerTabNum. |

Para mais detalhes sobre cada função, consulte a @documentação da Senior.
