/**
 * ============================================================
 * TELA_TRANSACOES.JS — Lista Completa de Transações
 * ============================================================
 * 
 * Exibe todas as transações agrupadas por data com:
 * - Abas de filtro: Todas / Entradas / Saídas
 * - Lista agrupada por dia (SectionList)
 * - Chips de filtro adicionais (Categoria)
 * 
 * Ao clicar em uma transação, navega para TelaDetalhesTransacao.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { agruparPorData } from '../utilitarios/formatadores';
import { filtrarPorTipo } from '../utilitarios/calculadores';
import FiltroAbas from '../componentes/FiltroAbas';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

/** Abas disponíveis para filtrar transações */
const ABAS_FILTRO = ['Todas', 'Entradas', 'Saídas'];

/**
 * Tela de listagem completa de transações.
 * 
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaTransacoes = ({ navigation }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { transacoes, carregando } = useTransacoes();
  
  /** Aba de filtro selecionada (Todas, Entradas, Saídas) */
  const [filtroAtivo, setFiltroAtivo] = useState('Todas');

  /**
   * Filtra e agrupa as transações com base na aba selecionada.
   * Usa useMemo para recalcular apenas quando os dados mudam.
   */
  const secoes = useMemo(() => {
    // Mapeia o nome da aba para o tipo de filtro
    const mapaFiltro = {
      'Todas': 'todas',
      'Entradas': 'entradas',
      'Saídas': 'saidas',
    };
    const transacoesFiltradas = filtrarPorTipo(transacoes, mapaFiltro[filtroAtivo]);
    return agruparPorData(transacoesFiltradas);
  }, [transacoes, filtroAtivo]);

  /** Exibe loading enquanto carrega */
  if (carregando && transacoes.length === 0) {
    return <CarregandoIndicador />;
  }

  return (
    <View style={estilos.container}>
      {/* Header */}
      <View style={estilos.header}>
        <Text style={estilos.titulo}>Transações</Text>
        <View style={estilos.headerIcones}>
          <TouchableOpacity style={estilos.iconeBotao}>
            <Feather name="search" size={22} color={CORES.principal} />
          </TouchableOpacity>
          <TouchableOpacity style={estilos.iconeBotao}>
            <Feather name="filter" size={22} color={CORES.principal} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Abas de filtro */}
      <View style={estilos.containerFiltro}>
        <FiltroAbas
          abas={ABAS_FILTRO}
          abaSelecionada={filtroAtivo}
          aoSelecionarAba={setFiltroAtivo}
        />
      </View>

      {/* Lista de transações agrupada por data */}
      <SectionList
        sections={secoes.map((s) => ({ title: s.titulo, data: s.dados }))}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        /* Renderiza o cabeçalho de cada seção (data) */
        renderSectionHeader={({ section: { title } }) => (
          <Text style={estilos.secaoTitulo}>{title}</Text>
        )}
        /* Renderiza cada item de transação */
        renderItem={({ item }) => (
          <ItemTransacao
            transacao={item}
            mostrarBadge={true}
            aoClicar={(t) =>
              navigation.navigate('DetalhesTransacao', { transacao: t })
            }
          />
        )}
        /* Estado vazio */
        ListEmptyComponent={
          <View style={estilos.semDados}>
            <Feather name="inbox" size={48} color={CORES.textoSecundario} />
            <Text style={estilos.semDadosTexto}>Nenhuma transação encontrada</Text>
          </View>
        }
      />
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
  },
  headerIcones: {
    flexDirection: 'row',
    gap: 10,
  },
  iconeBotao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: CORES.branco,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerFiltro: {
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
  },
  listaConteudo: {
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 100,
  },
  secaoTitulo: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  semDados: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  semDadosTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
    marginTop: 16,
  },
});

export default TelaTransacoes;
