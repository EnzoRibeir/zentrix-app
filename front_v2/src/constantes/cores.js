/**
 * ============================================================
 * CORES.JS — Paleta de Cores do App Zentrix
 * ============================================================
 */

export const CORES_CLARAS = {
  principal: '#274C77',
  secundaria: '#4471A0',
  destaque: '#A3CEF1',
  fundo: '#EFF2F4',
  branco: '#FFFFFF',
  textoSecundario: '#8A8D8D',
  textoPrincipal: '#1A1A2E',
  borda: '#E0E4E8',
};

export const CORES_ESCURAS = {
  principal: '#A3CEF1', // Destacamos mais o azul claro no tema escuro
  secundaria: '#4471A0',
  destaque: '#274C77', // Invertemos com o principal para harmonia
  fundo: '#121212', // Cinza muito escuro/preto
  branco: '#1E1E1E', // Fundos de cards no tema escuro
  textoSecundario: '#A0A0A0',
  textoPrincipal: '#F5F5F5',
  borda: '#333333',
};

// ===========================================
// CORES SEMÂNTICAS (feedback visual) - Mantêm-se parecidas para não quebrar a lógica
// ===========================================
export const CORES_SEMANTICAS = {
  sucesso: '#4CAF50',
  erro: '#E53935',
  alerta: '#FBC02D',
  info: '#1E88E5',
};

// ===========================================
// CORES POR CATEGORIA (mapeiam com backend)
// ===========================================
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

export const GRADIENTES = {
  principal: ['#274C77', '#4471A0'],
  escuro: ['#121212', '#1E1E1E'],
  receita: ['#2E7D32', '#4CAF50'],
  despesa: ['#C62828', '#EF5350'],
};

// Mantemos o CORES exportado temporariamente para arquivos não refatorados não quebrarem (default para claras)
export const CORES = CORES_CLARAS;
