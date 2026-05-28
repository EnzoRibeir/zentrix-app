/**
 * ============================================================
 * FORMATADORES.JS — Funções de Formatação do App Zentrix
 * ============================================================
 * 
 * Funções utilitárias para formatar dados antes de exibir na tela.
 * Inclui: moeda (BRL), datas, horas e agrupamentos.
 * 
 * Todas as funções são puras (sem efeitos colaterais).
 */

// ===========================================
// FORMATAÇÃO DE MOEDA
// ===========================================

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * 
 * @param {number|string} valor - Valor a ser formatado
 * @param {boolean} comSinal - Se true, adiciona + ou - antes do valor
 * @returns {string} Valor formatado (ex: "R$ 1.000,00" ou "+R$ 5.000,00")
 * 
 * @example
 * formatarMoeda(1000)        // "R$ 1.000,00"
 * formatarMoeda(5000, true)  // "+R$ 5.000,00"
 * formatarMoeda(-150, true)  // "-R$ 150,00"
 */
export const formatarMoeda = (valor, comSinal = false) => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) return 'R$ 0,00';

  const formatado = Math.abs(numero).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  if (comSinal) {
    return numero >= 0 ? `+${formatado}` : `-${formatado}`;
  }

  return formatado;
};

/**
 * Formata um valor como moeda compacta (sem centavos) para exibição em cards.
 * 
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} Valor formatado compacto (ex: "R$1000")
 */
export const formatarMoedaCompacta = (valor) => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numero)) return 'R$0';
  return `R$${Math.abs(numero).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// ===========================================
// FORMATAÇÃO DE DATA E HORA
// ===========================================

/** Nomes dos meses em português */
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Nomes curtos dos meses */
const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/**
 * Formata uma data no padrão completo brasileiro.
 * 
 * @param {string} dataString - Data no formato do backend (ex: "2026-05-22 00:05:00")
 * @returns {string} Data formatada (ex: "22 de Maio de 2026")
 */
export const formatarData = (dataString) => {
  const data = new Date(dataString);
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = MESES[data.getMonth()];
  const ano = data.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
};

/**
 * Formata uma data no padrão curto (DD/MM/AAAA).
 * 
 * @param {string} dataString - Data no formato do backend
 * @returns {string} Data formatada (ex: "22/05/2026")
 */
export const formatarDataCurta = (dataString) => {
  const data = new Date(dataString);
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

/**
 * Formata apenas o horário de uma data.
 * 
 * @param {string} dataString - Data no formato do backend
 * @returns {string} Horário formatado (ex: "10:25")
 */
export const formatarHora = (dataString) => {
  const data = new Date(dataString);
  const horas = data.getHours().toString().padStart(2, '0');
  const minutos = data.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
};

/**
 * Retorna um label relativo para uma data (Hoje, Ontem, ou data formatada).
 * 
 * @param {Date} data - Objeto Date a ser analisado
 * @returns {string} Label relativo (ex: "Hoje, 9 de Maio", "Ontem, 8 de Maio", "7 de Maio")
 */
export const obterLabelData = (data) => {
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const dia = data.getDate();
  const mes = MESES[data.getMonth()];

  if (data.toDateString() === hoje.toDateString()) {
    return `Hoje, ${dia} de ${mes}`;
  }
  if (data.toDateString() === ontem.toDateString()) {
    return `Ontem, ${dia} de ${mes}`;
  }
  return `${dia} de ${mes}`;
};

/**
 * Agrupa transações por data para usar em SectionList.
 * Cada grupo tem um título (ex: "Hoje, 9 de Maio") e suas transações.
 * 
 * @param {Array} transacoes - Lista de transações do backend
 * @returns {Array<{titulo: string, dados: Array}>} Seções agrupadas por data
 * 
 * @example
 * // Retorno:
 * [
 *   { titulo: "Hoje, 9 de Maio", dados: [transacao1, transacao2] },
 *   { titulo: "Ontem, 8 de Maio", dados: [transacao3] },
 * ]
 */
export const agruparPorData = (transacoes) => {
  const grupos = {};

  transacoes.forEach((transacao) => {
    const data = new Date(transacao.created_at);
    const chave = data.toDateString(); // Chave única por dia
    const label = obterLabelData(data);

    if (!grupos[chave]) {
      grupos[chave] = {
        titulo: label,
        dados: [],
        dataOrdenacao: data,
      };
    }
    grupos[chave].dados.push(transacao);
  });

  // Ordena os grupos por data (mais recente primeiro)
  return Object.values(grupos)
    .sort((a, b) => b.dataOrdenacao - a.dataOrdenacao)
    .map(({ titulo, dados }) => ({ titulo, dados }));
};

/**
 * Formata data e hora juntos para exibição em detalhes.
 * 
 * @param {string} dataString - Data no formato do backend
 * @returns {string} Data e hora formatados (ex: "09 de Maio de 2026 • 10:25")
 */
export const formatarDataHora = (dataString) => {
  return `${formatarData(dataString)} • ${formatarHora(dataString)}`;
};
