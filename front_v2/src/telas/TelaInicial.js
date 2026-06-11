/**
 * ============================================================
 * TELA_INICIAL.JS — Tela Home do App Zentrix
 * ============================================================
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { useAuth } from '../contextos/AuthContexto';
import { useNotificacoes } from '../contextos/NotificacoesContexto';
import { formatarMoeda } from '../utilitarios/formatadores';
import {
  calcularTotalGasto,
  calcularGastosPorCategoria,
} from '../utilitarios/calculadores';
import BarraProgresso from '../componentes/BarraProgresso';
import GraficoCategorias from '../componentes/GraficoCategorias';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

const LIMITE_PADRAO = 1000;

const TelaInicial = ({ navigation }) => {
  const { CORES } = useTema();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilos(CORES, insets);

  const { transacoes, usuario, carregando, carregar } = useTransacoes();
  const { usuario: usuarioAuth } = useAuth();
  const { naoLidosCount } = useNotificacoes();
  const [atualizando, setAtualizando] = useState(false);

  // Estado de pesquisa
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    carregar();
  }, [carregar]);

  const aoAtualizar = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  const limiteReal = usuario?.limite_mensal || LIMITE_PADRAO;
  const totalGasto = calcularTotalGasto(transacoes);
  const disponivel = limiteReal - totalGasto;
  const porcentagemUsada = (totalGasto / limiteReal) * 100;
  const gastosPorCategoria = calcularGastosPorCategoria(transacoes);

  // Filtra transações pela busca
  const transacoesFiltradas = termoBusca.trim()
    ? transacoes.filter((t) =>
        t.description?.toLowerCase().includes(termoBusca.toLowerCase())
      )
    : transacoes.slice(0, 5);

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
        {buscaVisivel ? (
          <View style={estilos.barraBusca}>
            <Feather name="search" size={18} color={CORES.textoSecundario} style={{ marginRight: 8 }} />
            <TextInput
              style={estilos.inputBusca}
              placeholder="Buscar transações..."
              placeholderTextColor={CORES.textoSecundario}
              value={termoBusca}
              onChangeText={setTermoBusca}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setBuscaVisivel(false); setTermoBusca(''); }}>
              <Feather name="x" size={18} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View>
              <Text style={estilos.saudacao}>Olá,</Text>
              <Text style={estilos.nomeUsuario}>{usuarioAuth?.nome || 'Usuário'}!</Text>
            </View>
            <View style={estilos.headerIcones}>
              <TouchableOpacity style={estilos.iconeBotao} onPress={() => setBuscaVisivel(true)}>
                <Feather name="search" size={22} color={CORES.principal} />
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.iconeBotao}
                onPress={() => navigation.navigate('Notificacoes')}
              >
                <Feather name="bell" size={22} color={CORES.principal} />
                {naoLidosCount > 0 && (
                  <View style={estilos.badge}>
                    <Text style={estilos.badgeTexto}>
                      {naoLidosCount > 9 ? '9+' : naoLidosCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Resultado da busca */}
      {termoBusca.trim() !== '' && (
        <Text style={estilos.resultadoBusca}>
          {transacoesFiltradas.length} resultado{transacoesFiltradas.length !== 1 ? 's' : ''} para "{termoBusca}"
        </Text>
      )}

      {/* Esconde os cards de resumo quando está buscando */}
      {!termoBusca.trim() && (
        <>
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
        </>
      )}

      {/* ============================================ */}
      {/* SEÇÃO: Transações (todas se buscando, últimas 5 se não) */}
      {/* ============================================ */}
      <View style={estilos.secao}>
        <View style={estilos.secaoHeader}>
          <Text style={estilos.secaoTitulo}>
            {termoBusca.trim() ? 'Resultados da Busca' : 'Últimas Transações'}
          </Text>
          {!termoBusca.trim() && (
            <TouchableOpacity onPress={() => navigation.navigate('Transações')}>
              <Text style={estilos.verTodas}>Ver Todas</Text>
            </TouchableOpacity>
          )}
        </View>

        {transacoesFiltradas.length === 0 ? (
          <View style={estilos.semTransacoes}>
            <Feather name="inbox" size={40} color={CORES.textoSecundario} />
            <Text style={estilos.semTransacoesTexto}>
              {termoBusca.trim()
                ? 'Nenhuma transação encontrada para essa busca'
                : 'Nenhuma transação encontrada'}
            </Text>
          </View>
        ) : (
          transacoesFiltradas.map((transacao) => (
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

const criarEstilos = (CORES, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    // Respeita a barra de notificações do celular no topo
    paddingTop: insets.top + 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  // Barra de busca (substitui o header)
  barraBusca: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.branco,
    borderRadius: 23,
    paddingHorizontal: 16,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputBusca: {
    flex: 1,
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    padding: 0,
  },
  resultadoBusca: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginBottom: 12,
  },
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
    textAlign: 'center',
  },
});

export default TelaInicial;
