/**
 * ============================================================
 * CATEGORIAS.JS — Mapeamento de Categorias do App Zentrix
 * ============================================================
 * 
 * Mapeia cada categoria do backend para:
 * - Ícone (nome do ícone do @expo/vector-icons)
 * - Cor (cor de fundo do ícone)
 * - Emoji (alternativa visual)
 * - Biblioteca de ícones (Feather, MaterialIcons, etc.)
 * 
 * Categorias definidas no backend (v4.py, linha 25-28):
 * ["Essencial", "Role e Lazer", "Rangos", "Transporte", 
 *  "Assinaturas", "Compras e Mimos", "A receber", "Outros"]
 */

/**
 * Mapa completo de cada categoria para seus atributos visuais.
 * Usado em: ItemTransacao, GraficoCategorias, filtros, detalhes.
 * 
 * @property {string} icone - Nome do ícone (compatível com @expo/vector-icons)
 * @property {string} biblioteca - Qual set de ícones usar (Feather, MaterialCommunityIcons, etc.)
 * @property {string} cor - Cor hexadecimal associada à categoria
 * @property {string} corFundo - Cor de fundo suave para o ícone (com opacidade)
 * @property {string} emoji - Emoji representativo da categoria
 */
export const MAPA_CATEGORIAS = {
  'Essencial': {
    icone: 'home',
    biblioteca: 'Feather',
    cor: '#274C77',
    corFundo: '#274C7720',
    emoji: '🏠',
  },
  'Role e Lazer': {
    icone: 'music',
    biblioteca: 'Feather',
    cor: '#E67E22',
    corFundo: '#E67E2220',
    emoji: '🎉',
  },
  'Rangos': {
    icone: 'coffee',
    biblioteca: 'Feather',
    cor: '#27AE60',
    corFundo: '#27AE6020',
    emoji: '🍔',
  },
  'Transporte': {
    icone: 'truck',
    biblioteca: 'Feather',
    cor: '#2ECC71',
    corFundo: '#2ECC7120',
    emoji: '🚗',
  },
  'Assinaturas': {
    icone: 'repeat',
    biblioteca: 'Feather',
    cor: '#8E44AD',
    corFundo: '#8E44AD20',
    emoji: '📺',
  },
  'Compras e Mimos': {
    icone: 'shopping-bag',
    biblioteca: 'Feather',
    cor: '#E74C3C',
    corFundo: '#E74C3C20',
    emoji: '🛍️',
  },
  'A receber': {
    icone: 'dollar-sign',
    biblioteca: 'Feather',
    cor: '#2E7D32',
    corFundo: '#2E7D3220',
    emoji: '💰',
  },
  'Outros': {
    icone: 'more-horizontal',
    biblioteca: 'Feather',
    cor: '#95A5A6',
    corFundo: '#95A5A620',
    emoji: '📌',
  },
};

/**
 * Retorna os dados visuais de uma categoria.
 * Se a categoria não existir no mapa, retorna o padrão "Outros".
 * 
 * @param {string} nomeCategoria - Nome da categoria vindo do backend
 * @returns {object} Objeto com icone, biblioteca, cor, corFundo e emoji
 */
export const obterCategoria = (nomeCategoria) => {
  return MAPA_CATEGORIAS[nomeCategoria] || MAPA_CATEGORIAS['Outros'];
};

/**
 * Lista ordenada de todas as categorias disponíveis.
 * Útil para renderizar filtros e dropdowns.
 */
export const LISTA_CATEGORIAS = Object.keys(MAPA_CATEGORIAS);

/**
 * Mapeamento de tipos de pagamento para cores de badge.
 * Tipos definidos no backend: [Débito, Crédito à Vista, Crédito Parcelado, Emprestado]
 */
export const CORES_TIPO_PAGAMENTO = {
  'Débito':            { cor: '#274C77', corFundo: '#274C7715', texto: 'Débito' },
  'Crédito à Vista':   { cor: '#4471A0', corFundo: '#4471A015', texto: 'Crédito' },
  'Crédito Parcelado': { cor: '#8E44AD', corFundo: '#8E44AD15', texto: 'Parcelado' },
  'Emprestado':        { cor: '#2E7D32', corFundo: '#2E7D3215', texto: 'Emprestado' },
};
