/**
 * ============================================================
 * GRAFICO_CATEGORIAS.JS — Gráfico de Rosca (Donut Chart)
 * ============================================================
 * 
 * Exibe os gastos por categoria em formato de gráfico de rosca.
 * Mostra o total no centro e a legenda ao lado.
 * 
 * Usado em: TelaInicial e TelaRelatorios.
 * 
 * Implementação: SVG puro (react-native-svg) para melhor controle
 * visual e performance, sem dependência de libs de gráficos pesadas.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { formatarMoeda } from '../utilitarios/formatadores';

/**
 * Gráfico de rosca (donut) com legenda lateral.
 * 
 * @param {Array<{nome, valor, porcentagem, cor}>} dados - Dados por categoria
 * @param {number} total - Valor total para exibir no centro
 * 
 * @example
 * <GraficoCategorias
 *   dados={[
 *     { nome: "Compras e Mimos", valor: 380, porcentagem: 43, cor: "#E74C3C" },
 *     { nome: "Rangos", valor: 500, porcentagem: 57, cor: "#27AE60" },
 *   ]}
 *   total={880}
 *   aoClicarCategoria={(nome) => console.log(nome)}
 * />
 */
const GraficoCategorias = ({ dados, total, aoClicarCategoria }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  // Configurações do SVG
  const tamanho = 160;
  const raio = 60;
  const espessura = 22;
  const centro = tamanho / 2;
  const circunferencia = 2 * Math.PI * raio;

  /**
   * Calcula os segmentos do gráfico de rosca.
   * Cada segmento é um <Circle> com strokeDasharray e strokeDashoffset.
   */
  let offsetAcumulado = 0;

  return (
    <View style={estilos.container}>
      {/* Gráfico SVG */}
      <View style={estilos.containerGrafico}>
        <Svg width={tamanho} height={tamanho}>
          <G rotation="-90" origin={`${centro}, ${centro}`}>
            {dados.map((item, indice) => {
              const comprimentoSegmento = (item.porcentagem / 100) * circunferencia;
              const offset = offsetAcumulado;
              offsetAcumulado += comprimentoSegmento;

              return (
                <Circle
                  key={indice}
                  cx={centro}
                  cy={centro}
                  r={raio}
                  fill="none"
                  stroke={item.cor}
                  strokeWidth={espessura}
                  strokeDasharray={`${comprimentoSegmento} ${circunferencia - comprimentoSegmento}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>

        {/* Texto central (Total) */}
        <View style={estilos.textoCentral}>
          <Text style={estilos.labelTotal}>Total</Text>
          <Text style={estilos.valorTotal}>{formatarMoeda(total)}</Text>
        </View>
      </View>

      {/* Legenda lateral */}
      <View style={estilos.containerLegenda}>
        {dados.map((item, indice) => (
          <TouchableOpacity 
            key={indice} 
            style={estilos.itemLegenda}
            onPress={() => aoClicarCategoria && aoClicarCategoria(item.nome)}
            activeOpacity={aoClicarCategoria ? 0.7 : 1}
          >
            {/* Bolinha colorida */}
            <View style={[estilos.bolinhaLegenda, { backgroundColor: item.cor }]} />
            {/* Nome da categoria */}
            <Text style={estilos.nomeLegenda} numberOfLines={1}>{item.nome}</Text>
            {/* Valor */}
            <Text style={estilos.valorLegenda}>{formatarMoeda(item.valor)}</Text>
            {/* Porcentagem */}
            <Text style={estilos.porcentagemLegenda}>{Math.round(item.porcentagem)}%</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  containerGrafico: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textoCentral: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelTotal: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
  },
  valorTotal: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
  },
  containerLegenda: {
    marginTop: 8,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bolinhaLegenda: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  nomeLegenda: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoPrincipal,
    flex: 1,
  },
  valorLegenda: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoPrincipal,
    marginRight: 12,
    width: 80,
    textAlign: 'right',
  },
  porcentagemLegenda: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    width: 35,
    textAlign: 'right',
  },
});

export default GraficoCategorias;
