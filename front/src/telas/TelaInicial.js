/**
 * ============================================================
 * TELA_INICIAL.JS — Tela Home do App Zentrix
 * ============================================================
 * 
 * Tela principal do app. Exibe:
 * 1. Saudação "Olá, Enzo!" com ícones de busca e notificação
 * 2. Card de Total Gasto com barra de progresso
 * 3. Gráfico de gastos por categoria (donut chart)
 * 4. Lista das últimas transações
 * 
 * Dados: Busca transações da API na montagem e suporta pull-to-refresh.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES, CORES_SEMANTICAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { formatarMoeda } from '../utilitarios/formatadores';
import {
  calcularTotalGasto,
  calcularGastosPorCategoria,
} from '../utilitarios/calculadores';
import BarraProgresso from '../componentes/BarraProgresso';
import GraficoCategorias from '../componentes/GraficoCategorias';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

/** Limite mensal padrão (usado caso não exista no perfil) */
const LIMITE_PADRAO = 1000;

/**
 * Tela Inicial (Home) do app.
 * Exibe resumo financeiro e últimas transações.
 * 
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaInicial = ({ navigation }) => {
  const { transacoes, usuario, carregando, carregar } = useTransacoes();
  const [atualizando, setAtualizando] = useState(false);

  /** Carrega transações ao montar a tela */
  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Função de pull-to-refresh */
  const aoAtualizar = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  // Cálculos derivados dos dados
  const limiteReal = usuario?.limite_mensal || LIMITE_PADRAO;
  const totalGasto = calcularTotalGasto(transacoes);
  const disponivel = limiteReal - totalGasto;
  const porcentagemUsada = (totalGasto / limiteReal) * 100;
  const gastosPorCategoria = calcularGastosPorCategoria(transacoes);
  const ultimasTransacoes = transacoes.slice(0, 5); // Mostra apenas as 5 mais recentes

  /** Exibe loading na primeira carga */
  if (carregando && transacoes.length === 0) {
    return <CarregandoIndicador mensagem="Carregando suas transações..." />;
  }

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={aoAtualizar}
          colors={[CORES.principal]}
          tintColor={CORES.principal}
        />
      }
    >
      {/* ============================================ */}
      {/* HEADER: Saudação + Ícones */}
      {/* ============================================ */}
      <View style={estilos.header}>
        <View>
          <Text style={estilos.saudacao}>Olá,</Text>
          <Text style={estilos.nomeUsuario}>Enzo!</Text>
        </View>
        <View style={estilos.headerIcones}>
          {/* Botão de busca */}
          <TouchableOpacity style={estilos.iconeBotao}>
            <Feather name="search" size={22} color={CORES.principal} />
          </TouchableOpacity>
          {/* Botão de notificações */}
          <TouchableOpacity
            style={estilos.iconeBotao}
            onPress={() => navigation.navigate('Notificacoes')}
          >
            <Feather name="bell" size={22} color={CORES.principal} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ============================================ */}
      {/* CARD: Total Gasto + Barra de Progresso */}
      {/* ============================================ */}
      <View style={estilos.cardPrincipal}>
        <Text style={estilos.cardLabel}>Total Gasto</Text>
        <Text style={estilos.cardValorGrande}>{formatarMoeda(totalGasto)}</Text>
        <BarraProgresso porcentagem={porcentagemUsada} />
        <View style={estilos.cardRodape}>
          <Text style={estilos.cardRodapeTexto}>
            Disponível: {formatarMoeda(Math.max(0, disponivel))}
          </Text>
          <Text style={estilos.cardRodapeTexto}>
            Limite: {formatarMoeda(limiteReal)}
          </Text>
        </View>
      </View>

      {/* ============================================ */}
      {/* SEÇÃO: Gastos por Categoria (Donut Chart) */}
      {/* ============================================ */}
      {gastosPorCategoria.length > 0 && (
        <View style={estilos.secao}>
          <View style={estilos.secaoHeader}>
            <Text style={estilos.secaoTitulo}>Gastos por Categoria</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categorias')}>
              <Text style={estilos.verTodas}>Ver Categorias</Text>
            </TouchableOpacity>
          </View>
          <GraficoCategorias
            dados={gastosPorCategoria}
            total={totalGasto}
            aoClicarCategoria={(nomeCat) => navigation.navigate('Categorias', { categoriaInicial: nomeCat })}
          />
        </View>
      )}

      {/* ============================================ */}
      {/* SEÇÃO: Últimas Transações */}
      {/* ============================================ */}
      <View style={estilos.secao}>
        <View style={estilos.secaoHeader}>
          <Text style={estilos.secaoTitulo}>Últimas Transações</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transações')}>
            <Text style={estilos.verTodas}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        {ultimasTransacoes.length === 0 ? (
          <View style={estilos.semTransacoes}>
            <Feather name="inbox" size={40} color={CORES.textoSecundario} />
            <Text style={estilos.semTransacoesTexto}>
              Nenhuma transação encontrada
            </Text>
          </View>
        ) : (
          ultimasTransacoes.map((transacao) => (
            <ItemTransacao
              key={transacao.id}
              transacao={transacao}
              mostrarBadge={false}
              aoClicar={(t) =>
                navigation.navigate('DetalhesTransacao', { transacao: t })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 100, // Espaço para a tab bar
  },
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  saudacao: {
    ...TIPOGRAFIA.tituloGrande,
    color: CORES.textoPrincipal,
    lineHeight: 38,
  },
  nomeUsuario: {
    ...TIPOGRAFIA.tituloGrande,
    color: CORES.textoPrincipal,
    lineHeight: 38,
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
  /* Card Principal */
  cardPrincipal: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLabel: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  cardValorGrande: {
    ...TIPOGRAFIA.valorDestaque,
    color: CORES.textoPrincipal,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardRodapeTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
  },
  /* Seções */
  secao: {
    marginBottom: ESPACAMENTOS.espacoEntreCards,
  },
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secaoTitulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
  },
  verTodas: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.secundaria,
  },
  /* Estado vazio */
  semTransacoes: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
  },
  semTransacoesTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
    marginTop: 12,
  },
});

export default TelaInicial;
