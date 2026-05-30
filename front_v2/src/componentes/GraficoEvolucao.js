/**
 * ============================================================
 * GRAFICO_EVOLUCAO.JS — Gráfico de Linha (Evolução de Gastos)
 * ============================================================
 * 
 * Exibe a evolução acumulada de gastos ao longo do mês.
 * Usa react-native-chart-kit para renderizar o gráfico de linha.
 * 
 * Usado em: TelaRelatorios (seção "Evolução de Gastos").
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';

/** Largura da tela para calcular o tamanho do gráfico */
const LARGURA_TELA = Dimensions.get('window').width;

/**
 * Gráfico de linha mostrando a evolução acumulada de gastos.
 * 
 * @param {Array<string>} labels - Labels do eixo X (datas: "01/05", "08/05")
 * @param {Array<number>} valores - Valores acumulados para o eixo Y
 * @param {string} titulo - Título do gráfico (ex: "Evolução de Gastos")
 */
const GraficoEvolucao = ({ labels, valores, titulo }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  // Se não há dados, exibe mensagem
  if (!valores || valores.length === 0) {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.semDados}>Sem dados para exibir</Text>
      </View>
    );
  }

  // Limita labels para não poluir o eixo X (máximo 6 labels)
  const passo = Math.max(1, Math.floor(labels.length / 6));
  const labelsReduzidos = labels.filter((_, i) => i % passo === 0 || i === labels.length - 1);

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>{titulo}</Text>

      <LineChart
        data={{
          labels: labelsReduzidos,
          datasets: [{ data: valores }],
        }}
        width={LARGURA_TELA - ESPACAMENTOS.margemHorizontal * 2 - ESPACAMENTOS.paddingCard * 2}
        height={200}
        yAxisLabel="R$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: CORES.branco,
          backgroundGradientFrom: CORES.branco,
          backgroundGradientTo: CORES.branco,
          decimalPlaces: 0,
          color: (opacidade = 1) => `rgba(39, 76, 119, ${opacidade})`, // CORES.principal
          labelColor: (opacidade = 1) => `rgba(185, 188, 188, ${opacidade})`, // CORES.textoSecundario
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: CORES.principal,
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // Linhas sólidas
            stroke: CORES.borda,
            strokeWidth: 1,
          },
          fillShadowGradient: CORES.destaque,
          fillShadowGradientOpacity: 0.3,
        }}
        bezier
        style={estilos.grafico}
        withInnerLines={true}
        withOuterLines={false}
        withShadow={true}
      />
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
    marginBottom: 16,
  },
  grafico: {
    borderRadius: 16,
    marginLeft: -16,
  },
  semDados: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default GraficoEvolucao;
