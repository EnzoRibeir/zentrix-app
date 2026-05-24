/**
 * ============================================================
 * TIPOGRAFIA.JS — Estilos de Tipografia do App Zentrix
 * ============================================================
 * 
 * Fonte principal: Itim (Google Fonts)
 * Todos os estilos de texto do app são definidos aqui.
 * 
 * Uso:
 *   import { TIPOGRAFIA } from '../constantes/tipografia';
 *   <Text style={TIPOGRAFIA.tituloGrande}>Olá!</Text>
 */

/** Nome da família da fonte carregada pelo expo-google-fonts */
export const FONTE_FAMILIA = 'Itim_400Regular';

/**
 * Estilos de tipografia pré-definidos para todo o app.
 * Cada estilo inclui fontFamily, fontSize e opcionalmente fontWeight/color.
 */
export const TIPOGRAFIA = {
  /** Título grande — usado na saudação do header (ex: "Olá, Enzo!") */
  tituloGrande: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 32,
  },

  /** Título médio — usado em títulos de seção (ex: "Transações") */
  tituloMedio: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 24,
  },

  /** Subtítulo — usado em nomes de cards e cabeçalhos menores */
  subtitulo: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 20,
  },

  /** Valor grande — usado para exibir valores monetários em destaque */
  valorDestaque: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 36,
  },

  /** Corpo — texto padrão usado em descrições e parágrafos */
  corpo: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 16,
  },

  /** Corpo pequeno — texto menor usado em detalhes secundários */
  corpoPequeno: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 14,
  },

  /** Legenda — texto bem pequeno para labels, datas e metadados */
  legenda: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 12,
  },

  /** Badge — texto de badges/tags (Débito, Crédito, Pix) */
  badge: {
    fontFamily: FONTE_FAMILIA,
    fontSize: 11,
  },
};
