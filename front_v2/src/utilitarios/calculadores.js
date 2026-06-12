/**
 * ============================================================
 * CALCULADORES.JS — Funções de Cálculo do App Zentrix
 * ============================================================
 * 
 * Funções que processam a lista de transações e geram
 * dados agregados para os gráficos e cards de resumo.
 */

import { CORES_CATEGORIAS } from '../constantes/cores';

/**
 * Função central para calcular qual o valor da transação no MÊS ATUAL.
 * 
 * - Débito / Crédito à Vista: 
 *     Se for do mês atual -> valor total
 *     Se for de outro mês -> 0
 * 
 * - Crédito Parcelado / Emprestado:
 *     Se a diferença de meses entre hoje e a compra for >= 0 e < num_parcelas -> valor / num_parcelas
 *     Senão -> 0
 */
export const obterValorNoMesAtual = (transacao) => {
  const agora = new Date();
  const dataTransacao = new Date(transacao.created_at);
  const valorTotal = parseFloat(transacao.amount || 0);
  
  // Meses de diferença (ex: se comprou mês passado e hoje é este mês = 1)
  const diffMeses = (agora.getFullYear() - dataTransacao.getFullYear()) * 12 
                    + (agora.getMonth() - dataTransacao.getMonth());

  const parcelas = parseInt(transacao.installments_total || 1, 10);
  const tipo = transacao.type;

  // Parcelados e Empréstimos
  if ((tipo === 'Crédito Parcelado' || tipo === 'Emprestado') && parcelas > 1) {
    if (diffMeses >= 0 && diffMeses < parcelas) {
      return valorTotal / parcelas;
    }
    return 0; // Já acabou de pagar ou é uma data no futuro
  }

  // À vista / Débito (só contam no mês exato da compra)
  if (diffMeses === 0) {
    return valorTotal;
  }

  return 0;
};

// ===========================================
// CÁLCULOS DE TOTAIS
// ===========================================

export const calcularTotalGasto = (transacoes) => {
  return transacoes
    .filter((t) => t.type !== 'Emprestado')
    .reduce((soma, t) => soma + obterValorNoMesAtual(t), 0);
};

export const calcularTotalRecebido = (transacoes) => {
  return transacoes
    .filter((t) => t.type === 'Emprestado')
    .reduce((soma, t) => soma + obterValorNoMesAtual(t), 0);
};

export const calcularSaldo = (transacoes) => {
  return calcularTotalRecebido(transacoes) - calcularTotalGasto(transacoes);
};

export const calcularMediaDiaria = (transacoes) => {
  const hoje = new Date();
  const diaAtual = Math.max(1, hoje.getDate());
  const totalGasto = calcularTotalGasto(transacoes);
  
  // Média é o quanto gastou no mês dividido pelo dia atual do mês
  return totalGasto / diaAtual;
};

// ===========================================
// CÁLCULOS POR CATEGORIA
// ===========================================

export const calcularGastosPorCategoria = (transacoes) => {
  const agrupado = {};
  
  transacoes
    .filter((t) => t.type !== 'Emprestado')
    .forEach((t) => {
      const valorNoMes = obterValorNoMesAtual(t);
      if (valorNoMes > 0) {
        const categoria = t.category || 'Outros';
        agrupado[categoria] = (agrupado[categoria] || 0) + valorNoMes;
      }
    });

  const totalGeral = Object.values(agrupado).reduce((soma, v) => soma + v, 0);

  return Object.entries(agrupado)
    .map(([nome, valor]) => ({
      nome,
      valor,
      porcentagem: totalGeral > 0 ? (valor / totalGeral) * 100 : 0,
      cor: CORES_CATEGORIAS[nome] || CORES_CATEGORIAS['Outros'],
    }))
    .sort((a, b) => b.valor - a.valor);
};

// ===========================================
// CÁLCULOS PARA GRÁFICO DE EVOLUÇÃO
// ===========================================

export const calcularEvolucaoGastos = (transacoes) => {
  // Pega apenas as que têm valor no mês atual (exclui meses passados)
  const despesasDoMes = transacoes
    .filter((t) => t.type !== 'Emprestado')
    .map(t => ({
      ...t,
      valorMes: obterValorNoMesAtual(t)
    }))
    .filter(t => t.valorMes > 0)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (despesasDoMes.length === 0) {
    return { labels: [], valores: [] };
  }

  const labels = [];
  const valores = [];
  let acumulado = 0;

  despesasDoMes.forEach((t) => {
    acumulado += t.valorMes;
    const data = new Date(t.created_at);
    // Transações parceladas caem no dia original da compra. Se quiser no dia 1, a lógica seria outra.
    const label = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
    labels.push(label);
    valores.push(acumulado);
  });

  return { labels, valores };
};

// ===========================================
// FILTROS DE TRANSAÇÕES
// ===========================================

export const filtrarPorTipo = (transacoes, filtro) => {
  switch (filtro) {
    case 'entradas':
      return transacoes.filter((t) => t.type === 'Emprestado');
    case 'saidas':
      return transacoes.filter((t) => t.type !== 'Emprestado');
    default:
      return transacoes;
  }
};

export const filtrarPorCategoria = (transacoes, categoria) => {
  if (categoria === 'todas' || !categoria) return transacoes;
  return transacoes.filter((t) => t.category === categoria);
};

export const filtrarMesAtual = (transacoes) => {
  // Mantemos o conceito de "transação impacta o mês atual" (seja à vista ou parcelado)
  return transacoes.filter((t) => obterValorNoMesAtual(t) > 0);
};

