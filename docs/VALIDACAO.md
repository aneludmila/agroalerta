# Evidências de validação funcional

Data: 13/10/2026. Aplicação: AgroAlerta, protótipo estático com dados simulados.

## Execução
`npm run check`, `npm test` e `npm run audit:source`.

## Motor: 12 cenários aprovados
- Diesel: 80 L, 10 L/dia e 8 dias de cobertura; preço desconhecido permanece ausente.
- Lote vencido excluído do saldo utilizável e retirada vencida bloqueada.
- Entrada de 100 L aumenta cobertura para 18 dias; retirada excessiva não é salva.
- Saída retroativa não pode gerar negativo no histórico.
- Histórico curto e consumo zero não produzem cobertura enganosa.
- Retirada incomum detectada por mediana anterior.
- Projeção FEFO não conta o mesmo consumo duas vezes.
- CSV com BOM, aspas e separador dentro da descrição.
- Reimportação idempotente e ID com conteúdo conflitante rejeitado.
- Unidades diferentes permanecem em produtos distintos.
- Datas inexistentes, números negativos e ausência de entrada inicial bloqueados.
- Ordem das linhas CSV não altera o saldo cronológico.

## Interface: 13 cenários agrupados aprovados
- As seis telas da navegação e o botão principal de prioridades.
- Busca e filtro de prioridade dos alertas.
- Busca, categoria, abertura de detalhes e fechamento do diálogo.
- Registro de entrada e atualização de saldo/cobertura na tabela.
- Saída excessiva e saída de lote vencido bloqueadas sem persistência.
- Exibição dos campos de novo lote e cadastro de produto com histórico limitado.
- Busca/filtro de movimentações; geração dos downloads CSV e JSON.
- Alteração de critérios, persistência e reanálise.
- Importação inválida atômica, importação válida e duplicidade ignorada.
- Modelo CSV, cancelamento de limpeza, backup inválido rejeitado, limpeza e restauração.
- Campos com apenas espaços rejeitados em código de lote e destino/responsável.
- Nomes contendo HTML renderizados como texto, sem injeção de elementos.
- Retorno à demonstração com identificação de dados simulados, sem erros de execução capturados.

O executor contabiliza 26 testes: 12 do motor, 13 subtestes de interface e 1 agrupador.

## Método e limites
Interações testadas em jsdom, não em navegador real. Diálogos nativos, confirmações, seleção de arquivo e download possuem adaptações no ambiente de teste. A validação testa manipuladores, dados renderizados e persistência; não comprova layout, responsividade, comportamento nativo de arquivos ou compatibilidade entre navegadores. Não houve validação com usuários de campo nem execução com a base oficial.

## Segurança da entrega pública
Seleção explícita de arquivos em PUBLIC_FILES.json; sem configuração privada de hospedagem, credenciais, .env, dados reais ou backups. Scanner de padrões comuns e revisão do código. A aplicação não usa chaves externas. A proteção da conta/hospedagem não é implementada pela interface. Persistência local ao navegador; exportar backup antes de limpeza.
