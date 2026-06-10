/**
 * ============================================================
 * TELA_TRANSACOES.JS — Lista Completa de Transações
 * ============================================================
 *
 * Exibe todas as transações agrupadas por data com:
 * - Abas de filtro: Todas / Entradas / Saídas
 * - Barra de pesquisa por descrição
 * - Modal de filtro por categoria
 * - Lista agrupada por dia (SectionList)
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  TextInput, Modal, ScrollView, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { agruparPorData } from '../utilitarios/formatadores';
import { filtrarPorTipo } from '../utilitarios/calculadores';
import { LISTA_CATEGORIAS, MAPA_CATEGORIAS } from '../constantes/categorias';
import FiltroAbas from '../componentes/FiltroAbas';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

const ABAS_FILTRO = ['Todas', 'Entradas', 'Saídas'];

const TelaTransacoes = ({ navigation }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);
  const { transacoes, carregando } = useTransacoes();

  const [filtroAtivo, setFiltroAtivo] = useState('Todas');
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

  const toggleCategoria = (cat) => {
    setCategoriasFiltradas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const limparFiltros = () => {
    setCategoriasFiltradas([]);
  };

  const secoes = useMemo(() => {
    const mapaFiltro = {
      'Todas': 'todas',
      'Entradas': 'entradas',
      'Saídas': 'saidas',
    };
    let resultado = filtrarPorTipo(transacoes, mapaFiltro[filtroAtivo]);

    // Filtro por busca (descrição)
    if (termoBusca.trim()) {
      const termoLower = termoBusca.toLowerCase();
      resultado = resultado.filter((t) =>
        t.description?.toLowerCase().includes(termoLower)
      );
    }

    // Filtro por categorias selecionadas
    if (categoriasFiltradas.length > 0) {
      resultado = resultado.filter((t) =>
        categoriasFiltradas.includes(t.category)
      );
    }

    return agruparPorData(resultado);
  }, [transacoes, filtroAtivo, termoBusca, categoriasFiltradas]);

  const totalResultados = secoes.reduce((acc, s) => acc + s.dados.length, 0);
  const filtrosAtivos = categoriasFiltradas.length;

  if (carregando && transacoes.length === 0) {
    return <CarregandoIndicador />;
  }

  return (
    <View style={estilos.container}>
      {/* Header */}
      <View style={estilos.header}>
        {buscaVisivel ? (
          <View style={estilos.barraBusca}>
            <Feather name="search" size={18} color={CORES.textoSecundario} style={{ marginRight: 8 }} />
            <TextInput
              style={estilos.inputBusca}
              placeholder="Buscar por descrição..."
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
            <Text style={estilos.titulo}>Transações</Text>
            <View style={estilos.headerIcones}>
              <TouchableOpacity style={estilos.iconeBotao} onPress={() => setBuscaVisivel(true)}>
                <Feather name="search" size={22} color={CORES.principal} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.iconeBotao, filtrosAtivos > 0 && estilos.iconeBotaoAtivo]}
                onPress={() => setModalFiltroVisivel(true)}
              >
                <Feather name="filter" size={22} color={filtrosAtivos > 0 ? CORES.branco : CORES.principal} />
                {filtrosAtivos > 0 && (
                  <View style={estilos.badge}>
                    <Text style={estilos.badgeTexto}>{filtrosAtivos}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Chips de categorias ativas */}
      {categoriasFiltradas.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={estilos.containerChips}
          contentContainerStyle={{ paddingHorizontal: ESPACAMENTOS.margemHorizontal, gap: 8 }}
        >
          {categoriasFiltradas.map((cat) => {
            const info = MAPA_CATEGORIAS[cat] || MAPA_CATEGORIAS['Outros'];
            return (
              <TouchableOpacity
                key={cat}
                style={[estilos.chip, { backgroundColor: `${info.cor}20`, borderColor: info.cor }]}
                onPress={() => toggleCategoria(cat)}
              >
                <Text style={[estilos.chipTexto, { color: info.cor }]}>{info.emoji} {cat}</Text>
                <Feather name="x" size={12} color={info.cor} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Abas de filtro */}
      <View style={estilos.containerFiltro}>
        <FiltroAbas
          abas={ABAS_FILTRO}
          abaSelecionada={filtroAtivo}
          aoSelecionarAba={setFiltroAtivo}
        />
      </View>

      {/* Contador de resultados */}
      {(termoBusca || filtrosAtivos > 0) && (
        <Text style={estilos.contador}>
          {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Lista de transações agrupada por data */}
      <SectionList
        sections={secoes.map((s) => ({ title: s.titulo, data: s.dados }))}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={estilos.secaoTitulo}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <ItemTransacao
            transacao={item}
            mostrarBadge={true}
            aoClicar={(t) => navigation.navigate('DetalhesTransacao', { transacao: t })}
          />
        )}
        ListEmptyComponent={
          <View style={estilos.semDados}>
            <Feather name="inbox" size={48} color={CORES.textoSecundario} />
            <Text style={estilos.semDadosTexto}>
              {termoBusca || filtrosAtivos > 0
                ? 'Nenhuma transação encontrada\npara esses filtros'
                : 'Nenhuma transação encontrada'}
            </Text>
          </View>
        }
      />

      {/* Modal de Filtro por Categoria */}
      <Modal
        visible={modalFiltroVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltroVisivel(false)}
      >
        <TouchableOpacity
          style={estilos.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalFiltroVisivel(false)}
        />
        <View style={estilos.modalContainer}>
          <View style={estilos.modalHandle} />
          <View style={estilos.modalHeader}>
            <Text style={estilos.modalTitulo}>Filtrar por Categoria</Text>
            {categoriasFiltradas.length > 0 && (
              <TouchableOpacity onPress={limparFiltros}>
                <Text style={estilos.limparTexto}>Limpar tudo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={estilos.gradeCategoria}>
            {LISTA_CATEGORIAS.map((cat) => {
              const info = MAPA_CATEGORIAS[cat] || MAPA_CATEGORIAS['Outros'];
              const ativo = categoriasFiltradas.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    estilos.cardCategoria,
                    ativo && { backgroundColor: `${info.cor}20`, borderColor: info.cor, borderWidth: 2 },
                  ]}
                  onPress={() => toggleCategoria(cat)}
                >
                  <Text style={estilos.emojiCategoria}>{info.emoji}</Text>
                  <Text style={[estilos.textoCategoria, ativo && { color: info.cor, fontWeight: '700' }]}>
                    {cat}
                  </Text>
                  {ativo && (
                    <View style={[estilos.checkIcone, { backgroundColor: info.cor }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[estilos.botaoAplicar, { backgroundColor: CORES.principal }]}
            onPress={() => setModalFiltroVisivel(false)}
          >
            <Text style={estilos.botaoAplicarTexto}>
              {categoriasFiltradas.length > 0
                ? `Ver resultados (${categoriasFiltradas.length} filtro${categoriasFiltradas.length > 1 ? 's' : ''})`
                : 'Fechar'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: ESPACAMENTOS.margemHorizontal, paddingTop: 10, paddingBottom: 16,
  },
  titulo: { ...TIPOGRAFIA.tituloMedio, color: CORES.textoPrincipal },
  headerIcones: { flexDirection: 'row', gap: 10 },
  iconeBotao: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: CORES.branco,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  iconeBotaoAtivo: { backgroundColor: CORES.principal },
  badge: {
    position: 'absolute', top: 8, right: 8, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center',
  },
  badgeTexto: { color: '#fff', fontSize: 9, fontWeight: '700' },
  barraBusca: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: CORES.branco, borderRadius: 23, paddingHorizontal: 16, height: 46,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputBusca: { flex: 1, ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal, padding: 0 },
  containerChips: { marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1,
  },
  chipTexto: { ...TIPOGRAFIA.legenda, fontWeight: '600' },
  containerFiltro: { paddingHorizontal: ESPACAMENTOS.margemHorizontal },
  contador: {
    ...TIPOGRAFIA.legenda, color: CORES.textoSecundario,
    paddingHorizontal: ESPACAMENTOS.margemHorizontal, marginBottom: 4, marginTop: 4,
  },
  listaConteudo: { paddingHorizontal: ESPACAMENTOS.margemHorizontal, paddingBottom: 100 },
  secaoTitulo: {
    ...TIPOGRAFIA.corpoPequeno, color: CORES.textoSecundario,
    marginTop: 16, marginBottom: 8, fontWeight: '600',
  },
  semDados: { alignItems: 'center', paddingVertical: 60 },
  semDadosTexto: { ...TIPOGRAFIA.corpo, color: CORES.textoSecundario, marginTop: 16, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: {
    backgroundColor: CORES.fundo, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: CORES.borda,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal },
  limparTexto: { ...TIPOGRAFIA.corpo, color: CORES.secundaria },
  gradeCategoria: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  cardCategoria: {
    width: '47%', backgroundColor: CORES.branco, borderRadius: 12,
    padding: 14, alignItems: 'center', position: 'relative',
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiCategoria: { fontSize: 28, marginBottom: 6 },
  textoCategoria: { ...TIPOGRAFIA.corpoPequeno, color: CORES.textoPrincipal, textAlign: 'center' },
  checkIcone: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
  },
  botaoAplicar: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  botaoAplicarTexto: { ...TIPOGRAFIA.corpo, color: '#fff', fontWeight: '700' },
});

export default TelaTransacoes;
