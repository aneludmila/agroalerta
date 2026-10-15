# 🌱 AgroAlerta

**Gestão inteligente de insumos rurais: do registro de estoque à decisão.**

O AgroAlerta é um protótipo web desenvolvido para o **AGROHACK 2026/2**, do IFRO Campus Ariquemes. A aplicação transforma registros de entradas e saídas em alertas explicáveis, estimativas de cobertura e prioridades para apoiar o responsável pelo estoque de uma propriedade rural.

## 🔗 Acesse o projeto

- **Aplicação:** [agroaleta.netlify.app](https://agroaleta.netlify.app/)
- **Vídeo de demonstração:** [Assistir no YouTube](https://youtu.be/ICoTeqFdzWU)
- **Código-fonte:** [aneludmila/agroalerta](https://github.com/aneludmila/agroalerta)

## O problema

Uma propriedade rural movimenta fertilizantes, corretivos, sementes, defensivos, produtos biológicos, combustíveis, lubrificantes, peças, materiais de irrigação e equipamentos de proteção.

Conhecer o saldo de cada produto não é suficiente para perceber riscos de falta, vencimento, excesso, consumo incomum ou valor financeiro concentrado em itens parados.

O desafio é transformar esses registros em informações que permitam **identificar problemas, antecipar necessidades e apoiar decisões de forma simples e eficiente**.

## A solução

O AgroAlerta apresenta uma lista de situações que merecem atenção. Cada alerta informa:

1. **O problema identificado.**
2. **Os dados e o critério que justificam o alerta.**
3. **Uma ação que o responsável pode considerar.**

Por exemplo: com 80 litros de diesel e consumo médio de 10 litros por dia, a cobertura estimada é de 8 dias. Ao registrar uma entrada de 100 litros, o saldo passa para 180 litros e a cobertura para 18 dias, mantendo o mesmo consumo médio.

Esse exemplo pertence à base simulada de demonstração.

## ✨ Funcionalidades

| Área | Recursos |
| --- | --- |
| Visão geral | Indicadores de estoque, produtos prioritários, risco de vencimento e valor conhecido armazenado |
| Central de alertas | Busca, filtro por prioridade, justificativas e ações sugeridas |
| Estoque | Cadastro de produtos, categorias, unidades, estoque mínimo e consulta de saldos |
| Lotes | Controle de quantidade, custo unitário e validade por lote |
| Movimentações | Registro de entradas, saídas, destino/origem e responsável |
| Histórico | Consulta de movimentações e gráfico de consumo por produto |
| Importação | Leitura de CSV, validação dos registros e identificação de duplicidades |
| Exportação | Movimentações em CSV e backup completo em JSON |
| Restauração | Validação e recuperação de backup JSON |
| Critérios | Ajuste de parâmetros e reanálise automática dos dados |

A aplicação bloqueia retiradas de lotes vencidos e movimentações que deixariam o saldo negativo em algum momento do histórico.

## 📊 Análises e alertas

Os critérios são propostas do projeto, não regras obrigatórias do edital.

| Situação | Critério utilizado |
| --- | --- |
| Estoque baixo | Saldo utilizável menor ou igual ao estoque mínimo cadastrado |
| Risco de falta | Cobertura estimada dentro da janela de urgência configurada |
| Vencimento | Validade do lote e projeção de consumo em ordem de vencimento |
| Retirada incomum | Quantidade superior a 3 vezes a mediana de pelo menos 5 retiradas anteriores nos 90 dias precedentes |
| Consumo crescente | Aumento superior a 50% entre duas janelas completas de consumo |
| Possível excesso | Cobertura superior à referência configurada |
| Produto parado | Ausência de retirada por pelo menos 60 dias |
| Variação de preço | Aumento superior a 20% entre os dois últimos lotes adquiridos com preço conhecido |

### Estimativa de cobertura

```text
Consumo médio diário = quantidade retirada na janela ÷ dias corridos da janela
Cobertura estimada = saldo utilizável ÷ consumo médio diário
```

A janela padrão é de **30 dias**, incluindo dias sem retirada. A estimativa exige uma janela histórica completa, considerando a data do primeiro registro, e pelo menos **3 saídas recentes**.

Quando não há consumo recente ou histórico suficiente, o sistema informa que a cobertura está indisponível. A primeira movimentação não comprova que o histórico está completo; essa condição deve ser confirmada com a origem dos dados.

### Prioridades

- **Atenção imediata:** falta de estoque utilizável, lote vencido, risco próximo de falta ou vencimento e inconsistência de saldo.
- **Acompanhar:** estoque abaixo do mínimo, risco de vencimento, consumo crescente e retirada incomum.
- **Revisar:** possível excesso, produtos parados e aumento de preço.

Um produto pode ter vários alertas. As explicações ficam disponíveis na interface para que o usuário compreenda a classificação.

## 🛠️ Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 e CSS3 | Estrutura e apresentação da interface |
| JavaScript com módulos ES | Navegação, formulários, importação e motor de análise |
| localStorage | Persistência dos registros no navegador |
| Node.js e node:test | Verificação de sintaxe e testes automatizados |
| jsdom | Testes das interações da interface em DOM simulado |
| GitHub Actions | Execução automática dos testes e auditoria dos arquivos públicos |
| Netlify | Hospedagem estática |

O protótipo não depende de banco de dados remoto ou APIs externas para analisar os registros.

## ▶️ Executar localmente

### Pré-requisitos

- Git para clonar o repositório.
- Python 3 para servir a aplicação localmente.
- Node.js 22 ou superior e npm para executar os testes.

```bash
git clone https://github.com/aneludmila/agroalerta.git
cd agroalerta
python3 -m http.server 8080 --directory dist
```

Abra **http://localhost:8080** no navegador.

Sirva os arquivos por HTTP. Abrir `index.html` diretamente com `file://` pode impedir o carregamento dos módulos JavaScript.

## 📁 Importar dados

A aplicação inicia com uma base **simulada**, identificada na interface. Esses dados não substituem a demonstração com a base oficial do desafio.

Para trabalhar somente com outra base:

1. Exporte um backup dos registros atuais.
2. Acesse **Importar dados** e escolha **Iniciar base vazia**.
3. Baixe o modelo CSV e adapte os registros ao formato.
4. Selecione a origem correta e importe o arquivo.
5. Confira os saldos, os tratamentos e os alertas gerados.

### Formato do CSV

Uma linha por movimentação, com cabeçalho:

```csv
id;produto;categoria;unidade;minimo;lote;tipo;data;quantidade;preco;validade;destino;responsavel
```

- Datas no formato `AAAA-MM-DD`.
- Tipo `entrada` ou `saida`.
- Incluir a entrada inicial de cada lote para permitir o cálculo do saldo.
- `preco` representa o custo **unitário** do lote; vazio significa desconhecido.
- `validade` pode ficar vazia quando não informada.
- Manter preço e validade consistentes nas linhas do mesmo lote.
- Utilizar códigos de lote distintos para aquisições com preços diferentes.
- Preferir IDs estáveis para cada movimentação.

Sem ID, movimentações com conteúdo idêntico são consideradas duplicadas. Duas retiradas legítimas idênticas precisam de IDs diferentes.

A importação é validada antes de salvar. Datas inválidas, quantidades negativas, IDs conflitantes e saldos históricos negativos bloqueiam a operação. Unidades diferentes permanecem separadas, sem conversão automática.

## 🧪 Testes e validação

```bash
npm ci --ignore-scripts
npm run check
npm test
npm run audit:source
```

Na validação registrada em **13/10/2026**, passaram:

- **12 cenários do motor de análise.**
- **13 cenários de interação da interface.**
- **26 testes contabilizados pelo executor**, incluindo o teste agrupador da interface.

Os cenários abrangem cobertura, vencimento, reanálise, bloqueio de saldos negativos, histórico insuficiente, anomalias, importação CSV, duplicidade, unidades, navegação, filtros, formulários, downloads, backup e restauração.

Os testes de interface utilizam **DOM simulado** com adaptações para diálogos e downloads. Eles não comprovam renderização visual, responsividade ou funcionamento nativo dos downloads em todos os navegadores.

Consulte as evidências e limitações em [docs/VALIDACAO.md](docs/VALIDACAO.md). A validação formal com usuários de campo e a demonstração com a base oficial não estão documentadas como concluídas.

## 🚀 Publicação no Netlify

O arquivo [netlify.toml](netlify.toml) configura:

- **Diretório de publicação:** `dist`.
- **Comando de verificação:** `npm run check && npm run audit:source`.
- **Versão do Node.js:** 22.

## 🔒 Persistência e segurança

Os dados ficam no **localStorage do navegador**, sem sincronização entre dispositivos. Limpar os dados do navegador pode remover os registros; exporte backups para preservá-los.

A versão atual não exige `.env`, senha, token ou chave de API. O [`.gitignore`](.gitignore) exclui arquivos comuns de segredo, backups e estados locais de hospedagem. A seleção dos arquivos públicos está em [PUBLIC_FILES.json](PUBLIC_FILES.json).

A auditoria automatizada procura padrões comuns de segredo e complementa a revisão humana. Caso sejam adicionados serviços externos, as credenciais devem permanecer no servidor e nunca no JavaScript entregue ao navegador.

## Limitações do protótipo

- As previsões pressupõem continuidade do consumo recente e podem variar conforme safra, calendário de atividades ou mudanças operacionais.
- Ausência de validade não significa ausência de risco; ausência de preço deixa o valor financeiro parcial.
- Retiradas incomuns são sinais para conferência, não provas de erro ou desvio.
- Possível excesso não significa que um item é desnecessário: reservas de manutenção e compras sazonais precisam ser avaliadas.
- Os alertas apoiam a gestão do estoque e não substituem orientação agronômica.

## 👥 Equipe

Projeto vinculado ao **AGROHACK 2026/2 — IFRO Campus Ariquemes**.

| Integrante | Função sugerida |
| --- | --- |
| Ane | Desenvolvimento da interface, integração das funcionalidades e organização do projeto |
| Julia | Análise dos dados e definição dos critérios de alerta |
| Luan | Testes funcionais, validação dos fluxos e registro das evidências |
| Kevin | Documentação, vídeo de demonstração e apresentação da solução |

Esta é uma divisão proposta de responsabilidades; deve ser ajustada pela equipe conforme as contribuições efetivamente realizadas. O repositório não publica matrículas, contatos privados ou credenciais.

## 🤖 Uso de inteligência artificial

ChatGPT/Codex foi utilizado como apoio ao desenvolvimento da interface, motor de análise, documentação e testes. Os integrantes devem compreender o código, revisar os resultados, validar os critérios e registrar suas contribuições e as partes apoiadas por IA.

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte [LICENSE](LICENSE).
