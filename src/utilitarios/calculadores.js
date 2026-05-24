/**
 * ============================================================
 * CALCULADORES.JS — Funções de Cálculo do App Zentrix
 * ============================================================
 * 
 * Funções que processam a lista de transações e geram
 * dados agregados para os gráficos e cards de resumo.
 * 
 * Todas as funções recebem a lista de transações e retornam
 * dados calculados. Não fazem chamadas à API.
 */

import { CORES_CATEGORIAS } from '../constantes/cores';
import { MAPA_CATEGORIAS } from '../constantes/categorias';

// ===========================================
// CÁLCULOS DE TOTAIS
// ===========================================

/**
 * Calcula o total gasto (soma de todas as transações do tipo despesa).
 * Tipos de despesa: "Débito", "Crédito à Vista", "Crédito Parcelado"
 * 
 * @param {Array} transacoes - Lista de transações do backend
 * @returns {number} Soma total dos gastos
 */
export const calcularTotalGasto = (transacoes) => {
  return transacoes
    .filter((t) => t.type !== 'Emprestado')
    .reduce((soma, t) => soma + parseFloat(t.amount || 0), 0);
};

/**
 * Calcula o total recebido/a receber (transações do tipo "Emprestado").
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {number} Soma total dos valores a receber
 */
export const calcularTotalRecebido = (transacoes) => {
  return transacoes
    .filter((t) => t.type === 'Emprestado')
    .reduce((soma, t) => soma + parseFloat(t.amount || 0), 0);
};

/**
 * Calcula o saldo do período (recebido - gasto).
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {number} Saldo do período
 */
export const calcularSaldo = (transacoes) => {
  const recebido = calcularTotalRecebido(transacoes);
  const gasto = calcularTotalGasto(transacoes);
  return recebido - gasto;
};

/**
 * Calcula a média diária de gastos no período.
 * Considera o número de dias entre a primeira e última transação.
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {number} Média diária de gastos
 */
export const calcularMediaDiaria = (transacoes) => {
  const despesas = transacoes.filter((t) => t.type !== 'Emprestado');
  if (despesas.length === 0) return 0;

  const total = calcularTotalGasto(transacoes);

  // Calcula o número de dias no período
  const datas = despesas.map((t) => new Date(t.created_at).getTime());
  const primeiraData = Math.min(...datas);
  const ultimaData = Math.max(...datas);
  const diasNoPeriodo = Math.max(1, Math.ceil((ultimaData - primeiraData) / (1000 * 60 * 60 * 24)));

  return total / diasNoPeriodo;
};

// ===========================================
// CÁLCULOS POR CATEGORIA (para gráfico de rosca)
// ===========================================

/**
 * Agrupa os gastos por categoria e calcula valor total e porcentagem de cada uma.
 * Usado para alimentar o gráfico de rosca (donut chart).
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {Array<{nome, valor, porcentagem, cor}>} Categorias com seus totais
 * 
 * @example
 * // Retorno:
 * [
 *   { nome: "Compras e Mimos", valor: 380, porcentagem: 43.2, cor: "#E74C3C" },
 *   { nome: "A receber", valor: 500, porcentagem: 56.8, cor: "#2E7D32" },
 * ]
 */
export const calcularGastosPorCategoria = (transacoes) => {
  // Agrupa valores por categoria
  const agrupado = {};
  transacoes.forEach((t) => {
    const categoria = t.category || 'Outros';
    const valor = parseFloat(t.amount || 0);
    agrupado[categoria] = (agrupado[categoria] || 0) + valor;
  });

  // Calcula o total geral para calcular porcentagens
  const totalGeral = Object.values(agrupado).reduce((soma, v) => soma + v, 0);

  // Converte para array e calcula porcentagem
  const resultado = Object.entries(agrupado)
    .map(([nome, valor]) => ({
      nome,
      valor,
      porcentagem: totalGeral > 0 ? (valor / totalGeral) * 100 : 0,
      cor: CORES_CATEGORIAS[nome] || CORES_CATEGORIAS['Outros'],
    }))
    .sort((a, b) => b.valor - a.valor); // Ordena por valor (maior primeiro)

  return resultado;
};

// ===========================================
// CÁLCULOS PARA GRÁFICO DE EVOLUÇÃO
// ===========================================

/**
 * Calcula a evolução acumulada de gastos ao longo do mês.
 * Retorna dados para o gráfico de linha.
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {object} Dados para o gráfico { labels: string[], valores: number[] }
 * 
 * @example
 * // Retorno:
 * {
 *   labels: ["01/05", "08/05", "15/05", "22/05"],
 *   valores: [80, 330, 580, 880]
 * }
 */
export const calcularEvolucaoGastos = (transacoes) => {
  const despesas = transacoes
    .filter((t) => t.type !== 'Emprestado')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (despesas.length === 0) {
    return { labels: [], valores: [] };
  }

  const labels = [];
  const valores = [];
  let acumulado = 0;

  despesas.forEach((t) => {
    acumulado += parseFloat(t.amount || 0);
    const data = new Date(t.created_at);
    const label = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
    labels.push(label);
    valores.push(acumulado);
  });

  return { labels, valores };
};

// ===========================================
// FILTROS DE TRANSAÇÕES
// ===========================================

/**
 * Filtra transações por tipo: "todas", "entradas" ou "saidas".
 * 
 * @param {Array} transacoes - Lista de transações
 * @param {string} filtro - Tipo de filtro: "todas" | "entradas" | "saidas"
 * @returns {Array} Transações filtradas
 */
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

/**
 * Filtra transações por categoria.
 * 
 * @param {Array} transacoes - Lista de transações
 * @param {string} categoria - Nome da categoria (ou "todas")
 * @returns {Array} Transações filtradas
 */
export const filtrarPorCategoria = (transacoes, categoria) => {
  if (categoria === 'todas' || !categoria) return transacoes;
  return transacoes.filter((t) => t.category === categoria);
};

/**
 * Filtra transações pelo mês atual.
 * 
 * @param {Array} transacoes - Lista de transações
 * @returns {Array} Transações do mês atual
 */
export const filtrarMesAtual = (transacoes) => {
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  return transacoes.filter((t) => {
    const data = new Date(t.created_at);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });
};
