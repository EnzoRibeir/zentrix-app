/**
 * ============================================================
 * CARREGANDO_INDICADOR.JS — Componente de Loading
 * ============================================================
 * 
 * Spinner de carregamento exibido enquanto a API responde.
 * Ocupa a tela inteira com fundo semi-transparente.
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';

/**
 * Indicador de carregamento centralizado na tela.
 * 
 * @param {string} mensagem - Texto exibido abaixo do spinner (opcional)
 */
const CarregandoIndicador = ({ mensagem = 'Carregando...' }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color={CORES.principal} />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.fundo,
  },
  texto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
    marginTop: 16,
  },
});

export default CarregandoIndicador;
