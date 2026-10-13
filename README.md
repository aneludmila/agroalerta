# AgroAlerta

Protótipo funcional para o AGROHACK 2026/2: gestão inteligente de insumos rurais com alertas explicáveis.

## Equipe
Preencher antes da entrega: nome da equipe, integrantes, cursos, funções e responsável de ADS. Não publicar matrículas, contatos privados ou credenciais.

## Executar
Sem dependências de interface e sem build. Na pasta do projeto:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir http://localhost:8080. Servir por HTTP; módulos JavaScript não devem ser abertos por file://.

## Funcionalidades
Visão geral; alertas com prioridade e justificativa; estoque e detalhes por lote; gráfico de consumo; cadastro de produto; entradas, saídas e novos lotes; importação CSV validada e atômica; exportação CSV; backup JSON; restauração validada; parâmetros ajustáveis; reanálise automática.

## Dados
A aplicação começa com dados SIMULADOS, gerados em relação à data atual de Rondônia. A base oficial não foi disponibilizada no desenvolvimento. Para usá-la, exportar backup, iniciar base vazia e adaptar o arquivo para o modelo da tela Importar dados. Uma linha por movimentação; incluir entradas iniciais; preço unitário e validade pertencem ao lote; IDs estáveis evitam duplicidade. Sem ID, linhas iguais são deduplicadas por conteúdo, o que exige IDs distintos em retiradas legítimas idênticas. Campos: id, produto, categoria, unidade, minimo, lote, tipo, data, quantidade, preco, validade, destino, responsavel. Dados de diferentes origens geram indicação de base mista.

Importação normaliza acentos, caixa e espaços para comparar nome, categoria e unidade; não converte unidades ou une nomes semelhantes. Histórico negativo e datas inválidas bloqueiam toda a importação. Preço/validade ausentes são null. Preços conflitantes no mesmo lote são bloqueados. Movimentações futuras não são aceitas.

## Regras e limites
Ver a tela Critérios de análise e dist/engine.mjs. Saldo físico por lote = entradas − saídas. Estoque utilizável exclui lotes vencidos. Consumo diário = saídas da janela / dias corridos; exige janela histórica completa pela primeira movimentação e pelo menos 3 saídas recentes. A primeira data não prova completude do histórico: confirmar com a origem. Cobertura desconhecida se falta histórico ou consumo é zero. FEFO aloca consumo projetado por ordem de vencimento sem dupla contagem. Retirada incomum: >3× mediana de no mínimo 5 saídas anteriores em 90 dias. Crescimento: >50% entre duas janelas completas. Possível excesso: cobertura acima de referência configurável. Item parado: 60 dias sem retirada. Variação de preço: >20% entre últimos lotes. Valores ausentes deixam o total parcial. Alertas não são recomendações agronômicas nem prova de desvio.

## Testes
Node.js 22 ou superior:

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run audit:source
```

12 cenários do motor e 13 cenários de interação DOM passaram (26 testes contabilizados pelo executor, incluindo o teste agrupador). Navegação, filtros, formulários, cadastro, entradas e saídas, novos lotes, downloads, CSV, duplicidade, backup, restauração, troca de base e critérios foram exercitados. Detalhes em docs/VALIDACAO.md. Os testes DOM usam jsdom com adaptadores para diálogos e downloads; não verificam renderização visual ou downloads reais de navegador. Revisão visual em navegador real e validação de campo permanecem pendentes.

## Código público e segredos
A aplicação não requer .env, senha, chave de API ou token. Os arquivos públicos estão explicitamente listados em PUBLIC_FILES.json. Configurações privadas de hospedagem, .git, node_modules, backups e credenciais não entram no pacote público. .gitignore protege contra inclusão acidental de arquivos comuns de segredo. A auditoria busca padrões de tokens e chaves privadas nos arquivos selecionados; não garante detecção de todo segredo possível. Ao adicionar serviços externos, manter segredos exclusivamente no servidor. Nunca colocar segredo no JavaScript entregue ao navegador.

## Roteiro de demonstração e validação
1. Identificar a origem simulada.
2. Conferir diesel: 80 L, consumo médio 10 L/dia, cobertura 8 dias.
3. Registrar entrada de 100 L no lote; verificar 180 L e cobertura de 18 dias.
4. Tentar saída maior que o saldo; verificar bloqueio sem alteração.
5. Conferir sementes vencidas e retirada incomum de ureia.
6. Exportar backup, abrir base vazia e importar CSV oficial adaptado quando disponível.
7. Reimportar o mesmo arquivo; verificar duplicadas ignoradas.
8. Ajustar critérios e mostrar reanálise.
9. Validar com responsável por estoque/estudante de Agronomia: pedir a primeira prioridade, a explicação e a decisão. Registrar feedback real e alterações. Não há validação de campo realizada ainda.

## Persistência
Dados em localStorage do navegador, sem servidor de dados ou sincronização entre dispositivos. Exportar backup para conservação. O Site começa privado ao proprietário. Para avaliação, equipe deverá preparar acesso aprovado ou executar localmente. A solução funciona sem APIs externas; hospedagem e autenticação do Site exigem rede.

## Autoria e IA
Desenvolvido com apoio de ChatGPT/Codex na interface, motor de regras, documentação e testes. Os integrantes devem revisar e compreender o código, validar resultados, registrar suas contribuições e declarar o uso de IA na entrega. Sem bibliotecas externas de interface, sem imagens de terceiros.

## Entrega acadêmica pendente
Preencher equipe, obter/adaptar base oficial, registrar validação real, gravar vídeo, preparar apresentação, enviar repositório GitHub acessível no portal e identificar versão por tag/commit. Prazo oficial de repositório: a divulgar pela organização. O protótipo não foi submetido à organização.

## Licença
MIT; ver LICENSE.
