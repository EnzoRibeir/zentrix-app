/**
 * ============================================================
 * ESPACAMENTOS.JS — Espaçamentos e Dimensões do App Zentrix
 * ============================================================
 * 
 * Define todas as constantes de layout: margens, paddings,
 * border-radius, alturas fixas, etc.
 * 
 * Nunca use valores mágicos nos componentes — importe daqui.
 */

export const ESPACAMENTOS = {
  /** Margem horizontal padrão das telas (distância das bordas) */
  margemHorizontal: 20,

  /** Espaço vertical entre cards/seções */
  espacoEntreCards: 16,

  /** Espaço interno padrão dos cards */
  paddingCard: 20,

  /** Espaço interno menor (usado em badges, chips) */
  paddingPequeno: 8,

  /** Espaço interno médio (usado em botões, inputs) */
  paddingMedio: 12,

  /** Raio de borda dos cards principais */
  raioBorda: 16,

  /** Raio de borda de badges e chips */
  raioBordaPequeno: 8,

  /** Raio de borda totalmente arredondado (botões circulares) */
  raioBordaCompleto: 50,

  /** Altura da bottom tab bar */
  alturaTabBar: 70,

  /** Tamanho do ícone padrão */
  tamanhoIcone: 24,

  /** Tamanho do ícone grande (botão "+" central) */
  tamanhoIconeGrande: 32,

  /** Tamanho do ícone de categoria (nos cards de transação) */
  tamanhoIconeCategoria: 48,

  /** Altura do header da tela */
  alturaHeader: 60,
};
