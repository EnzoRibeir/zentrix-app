/**
 * ============================================================
 * GRAFICO_CATEGORIAS.JS — Gráfico de Rosca (Donut Chart)
 * ============================================================
 *
 * Exibe os gastos por categoria em formato de gráfico de rosca.
 * Mostra o total no centro e uma legenda detalhada abaixo.
 *
 * Usado em: TelaInicial e TelaRelatorios.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { formatarMoeda } from '../utilitarios/formatadores';
import { obterCategoria } from '../constantes/categorias';

const GraficoCategorias = ({ dados, total, aoClicarCategoria }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);

  const tamanho = 160;
  const raio = 58;
  const espessura = 20;
  const centro = tamanho / 2;
  const circunferencia = 2 * Math.PI * raio;

  let offsetAcumulado = 0;

  const handleClicar = (nome) => {
    setCategoriaAtiva(prev => prev === nome ? null : nome);
    aoClicarCategoria && aoClicarCategoria(nome);
  };

  // Dado ativo para exibir no centro
  const dadoAtivo = categoriaAtiva
    ? dados.find(d => d.nome === categoriaAtiva)
    : null;

  return (
    <View style={estilos.container}>
      {/* Gráfico SVG + centro */}
      <View style={estilos.containerGrafico}>
        <Svg width={tamanho} height={tamanho}>
          <G rotation="-90" origin={`${centro}, ${centro}`}>
            {dados.map((item, indice) => {
              const comprimentoSegmento = (item.porcentagem / 100) * circunferencia;
              const offset = offsetAcumulado;
              offsetAcumulado += comprimentoSegmento;
              const ativo = categoriaAtiva === item.nome;

              return (
                <Circle
                  key={indice}
                  cx={centro}
                  cy={centro}
                  r={raio}
                  fill="none"
                  stroke={item.cor}
                  strokeWidth={ativo ? espessura + 4 : espessura}
                  strokeDasharray={`${comprimentoSegmento} ${circunferencia - comprimentoSegmento}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  opacity={categoriaAtiva && !ativo ? 0.35 : 1}
                />
              );
            })}
          </G>
        </Svg>

        {/* Texto central */}
        <View style={estilos.textoCentral}>
          {dadoAtivo ? (
            <>
              <Text style={[estilos.labelTotal, { color: dadoAtivo.cor }]} numberOfLines={1}>
                {dadoAtivo.nome.split(' ')[0]}
              </Text>
              <Text style={estilos.valorTotal}>{formatarMoeda(dadoAtivo.valor)}</Text>
              <Text style={[estilos.porcentagemCentro, { color: dadoAtivo.cor }]}>
                {Math.round(dadoAtivo.porcentagem)}%
              </Text>
            </>
          ) : (
            <>
              <Text style={estilos.labelTotal}>Total</Text>
              <Text style={estilos.valorTotal}>{formatarMoeda(total)}</Text>
              <Text style={estilos.qtdCategorias}>{dados.length} categ.</Text>
            </>
          )}
        </View>
      </View>

      {/* Separador */}
      <View style={estilos.separador} />

      {/* Legenda com barras de progresso */}
      <View style={estilos.containerLegenda}>
        {dados.map((item, indice) => {
          const catInfo = obterCategoria(item.nome);
          const ativo = categoriaAtiva === item.nome;
          return (
            <TouchableOpacity
              key={indice}
              style={[estilos.itemLegenda, ativo && { backgroundColor: `${item.cor}0D` }]}
              onPress={() => handleClicar(item.nome)}
              activeOpacity={0.75}
            >
              {/* Ícone da categoria */}
              <View style={[estilos.iconeCategoria, { backgroundColor: `${item.cor}1A` }]}>
                <Feather name={catInfo.icone} size={14} color={item.cor} />
              </View>

              {/* Nome + barra de progresso */}
              <View style={estilos.legendaConteudo}>
                <View style={estilos.legendaLinha}>
                  <Text style={[estilos.nomeLegenda, ativo && { color: item.cor }]} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <View style={estilos.legendaValores}>
                    <Text style={[estilos.valorLegenda, ativo && { color: item.cor }]}>
                      {formatarMoeda(item.valor)}
                    </Text>
                    <Text style={[estilos.porcentagemLegenda, { color: item.cor }]}>
                      {Math.round(item.porcentagem)}%
                    </Text>
                  </View>
                </View>
                {/* Barra de progresso */}
                <View style={estilos.barraFundo}>
                  <View
                    style={[
                      estilos.barraPreenchimento,
                      { width: `${item.porcentagem}%`, backgroundColor: item.cor },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dica de interação */}
      <Text style={estilos.dica}>Toque em uma categoria para destacar</Text>
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
    width: 90,
  },
  labelTotal: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    fontSize: 11,
  },
  valorTotal: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoPrincipal,
    fontSize: 13,
    textAlign: 'center',
  },
  qtdCategorias: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    fontSize: 10,
    marginTop: 1,
  },
  porcentagemCentro: {
    ...TIPOGRAFIA.legenda,
    fontSize: 11,
    marginTop: 1,
  },
  separador: {
    height: 1,
    backgroundColor: CORES.borda,
    marginBottom: 12,
  },
  containerLegenda: {
    gap: 2,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  iconeCategoria: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  legendaConteudo: {
    flex: 1,
  },
  legendaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nomeLegenda: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoPrincipal,
    flex: 1,
    fontSize: 13,
  },
  legendaValores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valorLegenda: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoPrincipal,
    fontSize: 12,
    textAlign: 'right',
  },
  porcentagemLegenda: {
    ...TIPOGRAFIA.legenda,
    fontSize: 11,
    width: 30,
    textAlign: 'right',
  },
  barraFundo: {
    height: 4,
    backgroundColor: CORES.borda,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: 4,
    borderRadius: 2,
  },
  dica: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
    opacity: 0.7,
  },
});

export default GraficoCategorias;
