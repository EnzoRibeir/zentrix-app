/**
 * ============================================================
 * BARRA_PROGRESSO.JS — Barra de Progresso de Gastos
 * ============================================================
 * 
 * Exibe visualmente quanto do limite mensal já foi gasto.
 * Aparece no card principal da Tela Inicial.
 * 
 * Comportamento:
 * - 0-70%: cor azul principal
 * - 70-90%: cor de alerta (amarelo)
 * - 90-100%: cor de erro (vermelho)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CORES, CORES_SEMANTICAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';

/**
 * Barra de progresso horizontal com porcentagem.
 * 
 * @param {number} porcentagem - Valor de 0 a 100
 */
const BarraProgresso = ({ porcentagem }) => {
  /** Limita a porcentagem entre 0 e 100 */
  const porcentagemLimitada = Math.min(100, Math.max(0, porcentagem));

  /** Define a cor com base na porcentagem de uso */
  const obterCor = () => {
    if (porcentagemLimitada >= 90) return CORES_SEMANTICAS.erro;
    if (porcentagemLimitada >= 70) return CORES_SEMANTICAS.alerta;
    return CORES.principal;
  };

  return (
    <View style={estilos.container}>
      {/* Fundo da barra (cinza) */}
      <View style={estilos.barraFundo}>
        {/* Preenchimento da barra (colorido) */}
        <View
          style={[
            estilos.barraPreenchimento,
            {
              width: `${porcentagemLimitada}%`,
              backgroundColor: obterCor(),
            },
          ]}
        />
      </View>
      {/* Texto da porcentagem */}
      <Text style={estilos.textoPorcentagem}>{Math.round(porcentagemLimitada)}%</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  barraFundo: {
    flex: 1,
    height: 10,
    backgroundColor: CORES.borda,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: '100%',
    borderRadius: 5,
  },
  textoPorcentagem: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginLeft: 8,
    width: 35,
    textAlign: 'right',
  },
});

export default BarraProgresso;
