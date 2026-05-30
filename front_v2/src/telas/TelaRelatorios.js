/**
 * ============================================================
 * TELA_RELATORIOS.JS — Tela de Relatórios Financeiros
 * ============================================================
 * 
 * Exibe relatórios visuais detalhados dos gastos do usuário:
 * 1. Abas de período (Este mês, Últimos 3 meses, etc.)
 * 2. Resumo do período (4 cards: Total Gasto, Recebido, Saldo, Média)
 * 3. Gráfico de evolução de gastos (linha)
 * 4. Gráfico de gastos por categoria (rosca)
 * 5. Comparativo de gastos (vs mês anterior / vs ano anterior)
 * 
 * Dados: Calculados localmente a partir das transações da API.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { formatarMoeda } from '../utilitarios/formatadores';
import {
  calcularTotalGasto,
  calcularTotalRecebido,
  calcularSaldo,
  calcularMediaDiaria,
  calcularGastosPorCategoria,
  calcularEvolucaoGastos,
} from '../utilitarios/calculadores';
import FiltroAbas from '../componentes/FiltroAbas';
import CartaoResumo from '../componentes/CartaoResumo';
import GraficoCategorias from '../componentes/GraficoCategorias';
import GraficoEvolucao from '../componentes/GraficoEvolucao';

/** Abas de período disponíveis */
const ABAS_PERIODO = ['Este mês', 'Últimos 3 meses', 'Este ano', 'Personalizado'];

/**
 * Tela de relatórios financeiros com gráficos e resumos.
 * 
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaRelatorios = ({ navigation }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { transacoes } = useTransacoes();
  const [periodoAtivo, setPeriodoAtivo] = useState('Este mês');

  // Cálculos derivados
  const totalGasto = useMemo(() => calcularTotalGasto(transacoes), [transacoes]);
  const totalRecebido = useMemo(() => calcularTotalRecebido(transacoes), [transacoes]);
  const saldo = useMemo(() => calcularSaldo(transacoes), [transacoes]);
  const mediaDiaria = useMemo(() => calcularMediaDiaria(transacoes), [transacoes]);
  const gastosPorCategoria = useMemo(() => calcularGastosPorCategoria(transacoes), [transacoes]);
  const evolucao = useMemo(() => calcularEvolucaoGastos(transacoes), [transacoes]);

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <View style={estilos.header}>
        <View>
          <Text style={estilos.titulo}>Relatórios</Text>
          <Text style={estilos.subtitulo}>Acompanhe sua saúde financeira</Text>
        </View>
        <View style={estilos.headerIcones}>
          <TouchableOpacity style={estilos.iconeBotao}>
            <Feather name="download" size={22} color={CORES.principal} />
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.iconeBotao}
            onPress={() => navigation.navigate('Notificacoes')}
          >
            <Feather name="bell" size={22} color={CORES.principal} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ============================================ */}
      {/* ABAS DE PERÍODO */}
      {/* ============================================ */}
      <FiltroAbas
        abas={ABAS_PERIODO}
        abaSelecionada={periodoAtivo}
        aoSelecionarAba={setPeriodoAtivo}
      />

      {/* ============================================ */}
      {/* RESUMO DO PERÍODO (4 cards) */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Resumo do período</Text>
      <View style={estilos.gridResumo}>
        <CartaoResumo
          icone="arrow-down-left"
          label="Total Gasto"
          valor={formatarMoeda(totalGasto)}
          corValor={CORES.textoPrincipal}
          corIcone={CORES.principal}
        />
        <View style={{ width: 10 }} />
        <CartaoResumo
          icone="arrow-up-right"
          label="Total Recebido"
          valor={formatarMoeda(totalRecebido)}
          corValor={CORES_SEMANTICAS.sucesso}
          corIcone={CORES_SEMANTICAS.sucesso}
        />
      </View>
      <View style={[estilos.gridResumo, { marginTop: 10 }]}>
        <CartaoResumo
          icone="trending-up"
          label="Saldo do Período"
          valor={formatarMoeda(saldo)}
          corValor={saldo >= 0 ? CORES_SEMANTICAS.sucesso : CORES_SEMANTICAS.erro}
          corIcone={CORES_SEMANTICAS.sucesso}
        />
        <View style={{ width: 10 }} />
        <CartaoResumo
          icone="bar-chart-2"
          label="Média Diária de Gastos"
          valor={formatarMoeda(mediaDiaria)}
          corValor={CORES.secundaria}
          corIcone={CORES.secundaria}
        />
      </View>

      {/* ============================================ */}
      {/* GRÁFICO: Evolução de Gastos */}
      {/* ============================================ */}
      <View style={estilos.secaoGrafico}>
        <GraficoEvolucao
          labels={evolucao.labels}
          valores={evolucao.valores}
          titulo="Evolução de Gastos"
        />
      </View>

      {/* ============================================ */}
      {/* GRÁFICO: Gastos por Categoria */}
      {/* ============================================ */}
      {gastosPorCategoria.length > 0 && (
        <View style={estilos.secaoGrafico}>
          <Text style={estilos.secaoTitulo}>Gastos por Categoria</Text>
          <GraficoCategorias
            dados={gastosPorCategoria}
            total={totalGasto}
          />
        </View>
      )}

      {/* ============================================ */}
      {/* COMPARATIVO DE GASTOS (Mockado) */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Comparativo de Gastos</Text>
      <View style={estilos.gridComparativo}>
        {/* vs Mês Anterior */}
        <View style={estilos.cardComparativo}>
          <View style={estilos.comparativoHeader}>
            <Feather name="trending-up" size={16} color={CORES_SEMANTICAS.erro} />
            <Text style={estilos.comparativoLabel}>vs. Mês Anterior</Text>
          </View>
          <Text style={[estilos.comparativoPorcentagem, { color: CORES_SEMANTICAS.erro }]}>
            +12,5%
          </Text>
          <Text style={estilos.comparativoValor}>{formatarMoeda(totalGasto * 0.89)}</Text>
          <Text style={estilos.comparativoDescricao}>
            Você gastou mais que no mês anterior
          </Text>
        </View>

        <View style={{ width: 10 }} />

        {/* vs Ano Anterior */}
        <View style={estilos.cardComparativo}>
          <View style={estilos.comparativoHeader}>
            <Feather name="trending-down" size={16} color={CORES_SEMANTICAS.sucesso} />
            <Text style={estilos.comparativoLabel}>vs. Mesmo período (Ano anterior)</Text>
          </View>
          <Text style={[estilos.comparativoPorcentagem, { color: CORES_SEMANTICAS.sucesso }]}>
            -8,3%
          </Text>
          <Text style={estilos.comparativoValor}>{formatarMoeda(totalGasto * 1.09)}</Text>
          <Text style={estilos.comparativoDescricao}>
            Você gastou menos que no ano anterior
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 100,
  },
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 10,
  },
  titulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
  },
  subtitulo: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  headerIcones: {
    flexDirection: 'row',
    gap: 10,
  },
  iconeBotao: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CORES.branco,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  /* Seções */
  secaoTitulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
    marginBottom: 12,
    marginTop: 16,
  },
  secaoGrafico: {
    marginTop: 16,
  },
  /* Grid de resumo (2 colunas) */
  gridResumo: {
    flexDirection: 'row',
  },
  /* Comparativo */
  gridComparativo: {
    flexDirection: 'row',
  },
  cardComparativo: {
    flex: 1,
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard - 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  comparativoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparativoLabel: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginLeft: 6,
    flex: 1,
  },
  comparativoPorcentagem: {
    ...TIPOGRAFIA.tituloMedio,
    marginBottom: 4,
  },
  comparativoValor: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginBottom: 8,
  },
  comparativoDescricao: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    lineHeight: 16,
  },
});

export default TelaRelatorios;
