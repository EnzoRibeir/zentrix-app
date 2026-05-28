/**
 * ============================================================
 * CORES.JS — Paleta de Cores do App Zentrix
 * ============================================================
 * 
 * Todas as cores foram extraídas diretamente do design no Figma.
 * Nunca use cores hardcoded nos componentes — sempre importe daqui.
 * 
 * Padrão de nomenclatura:
 * - Cores principais: nomes descritivos em português
 * - Cores de categoria: mapeiam para as categorias do backend
 * - Cores semânticas: sucesso, erro, alerta, info
 */

// ===========================================
// CORES PRINCIPAIS (extraídas do Figma)
// ===========================================
export const CORES = {
  /** Azul escuro — cor principal do app, usada em headers, botões primários e navbar */
  principal: '#274C77',

  /** Azul médio — cor secundária, usada em subtítulos e elementos de destaque */
  secundaria: '#4471A0',

  /** Azul claro — usada em degradês, detalhes decorativos e ícones suaves */
  destaque: '#A3CEF1',

  /** Cinza claro — cor de fundo geral do app */
  fundo: '#EFF2F4',

  /** Branco — fundo de cards e elementos elevados */
  branco: '#FFFFFF',

  /** Cinza médio — textos secundários, labels e sombreamentos */
  textoSecundario: '#B9BCBC',

  /** Cinza escuro — textos principais e títulos */
  textoPrincipal: '#1A1A2E',

  /** Cinza para bordas e separadores */
  borda: '#E0E4E8',
};

// ===========================================
// CORES SEMÂNTICAS (feedback visual)
// ===========================================
export const CORES_SEMANTICAS = {
  /** Verde — valores positivos, receitas, sucesso */
  sucesso: '#2E7D32',

  /** Vermelho — valores negativos, despesas, erro */
  erro: '#C62828',

  /** Amarelo — alertas e avisos */
  alerta: '#F9A825',

  /** Azul — informações e dicas */
  info: '#1565C0',
};

// ===========================================
// CORES POR CATEGORIA (mapeiam com backend)
// ===========================================
/** 
 * Cada cor corresponde a uma categoria definida no backend (v4.py).
 * Categorias: ["Essencial", "Role e Lazer", "Rangos", "Transporte", 
 *              "Assinaturas", "Compras e Mimos", "A receber", "Outros"]
 */
export const CORES_CATEGORIAS = {
  'Essencial':        '#274C77',  // Azul escuro
  'Role e Lazer':     '#E67E22',  // Laranja
  'Rangos':           '#27AE60',  // Verde
  'Transporte':       '#2ECC71',  // Verde claro
  'Assinaturas':      '#8E44AD',  // Roxo
  'Compras e Mimos':  '#E74C3C',  // Vermelho
  'A receber':        '#2E7D32',  // Verde escuro
  'Outros':           '#95A5A6',  // Cinza
};

// ===========================================
// GRADIENTES (usados em cards e backgrounds)
// ===========================================
export const GRADIENTES = {
  /** Gradiente principal: azul escuro → azul médio */
  principal: ['#274C77', '#4471A0'],

  /** Gradiente de destaque: azul médio → azul claro */
  destaque: ['#4471A0', '#A3CEF1'],

  /** Gradiente do card de receita */
  receita: ['#2E7D32', '#4CAF50'],

  /** Gradiente do card de despesa */
  despesa: ['#C62828', '#EF5350'],
};
