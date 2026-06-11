import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { useTema } from '../contextos/TemaContexto';
import { CORES_CATEGORIAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { formatarMoeda } from '../utilitarios/formatadores';
import { obterCategoria } from '../constantes/categorias';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaCategorias({ route, navigation }) {
  const { CORES } = useTema();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilos(CORES, insets);

  const { categoriaInicial } = route.params || {};
  const { transacoes, carregando } = useTransacoes();
  const [categoriaExpandida, setCategoriaExpandida] = useState(categoriaInicial || null);

  useEffect(() => {
    if (categoriaInicial) setCategoriaExpandida(categoriaInicial);
  }, [categoriaInicial]);

  if (carregando && transacoes.length === 0) return <CarregandoIndicador />;

  // Agrupa transações por categoria
  const categoriasAgrupadas = {};
  transacoes.forEach(t => {
    const cat = t.type === 'Emprestado' ? 'A receber' : (t.category || 'Outros');
    if (!categoriasAgrupadas[cat]) {
      categoriasAgrupadas[cat] = {
        nome: cat, itens: [], total: 0,
        cor: CORES_CATEGORIAS[cat] || CORES_CATEGORIAS['Outros'],
        pendentes: 0,
      };
    }
    categoriasAgrupadas[cat].itens.push(t);
    categoriasAgrupadas[cat].total += parseFloat(t.amount || 0);
    if (t.type === 'Emprestado' && (!t.status || t.status === 'PENDING')) {
      categoriasAgrupadas[cat].pendentes += parseFloat(t.amount || 0);
    }
  });

  const listaCategorias = Object.values(categoriasAgrupadas).sort((a, b) => b.total - a.total);
  const totalGeral = listaCategorias.reduce((acc, c) => acc + c.total, 0);

  const toggleExpandir = (nomeCategoria) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategoriaExpandida(prev => prev === nomeCategoria ? null : nomeCategoria);
  };

  return (
    <View style={estilos.container}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Feather name="arrow-left" size={24} color={CORES.textoPrincipal} />
        </TouchableOpacity>
        <View style={estilos.headerTexto}>
          <Text style={estilos.titulo}>Categorias</Text>
          <Text style={estilos.headerSubtitulo}>{listaCategorias.length} categorias · {formatarMoeda(totalGeral)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {listaCategorias.length === 0 ? (
          <View style={estilos.vazioContainer}>
            <Feather name="folder" size={48} color={CORES.borda} />
            <Text style={estilos.vazioTexto}>Nenhuma transação encontrada.</Text>
          </View>
        ) : (
          listaCategorias.map((cat) => {
            const expandido = categoriaExpandida === cat.nome;
            const catInfo = obterCategoria(cat.nome);
            const porcentagem = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;

            return (
              <View key={cat.nome} style={[estilos.accordionContainer, expandido && { borderColor: cat.cor + '40', borderWidth: 1 }]}>
                {/* Cabeçalho */}
                <TouchableOpacity
                  style={estilos.accordionHeader}
                  onPress={() => toggleExpandir(cat.nome)}
                  activeOpacity={0.7}
                >
                  {/* Ícone da categoria */}
                  <View style={[estilos.iconeCategoria, { backgroundColor: catInfo.corFundo }]}>
                    <Feather name={catInfo.icone} size={18} color={catInfo.cor} />
                  </View>

                  {/* Textos + barra */}
                  <View style={estilos.accordionMiddle}>
                    <View style={estilos.accordionLinhaTopo}>
                      <Text style={estilos.categoriaNome}>{cat.nome}</Text>
                      <Text style={estilos.categoriaTotal}>{formatarMoeda(cat.total)}</Text>
                    </View>
                    <View style={estilos.accordionLinhaInfo}>
                      <Text style={estilos.categoriaQtd}>
                        {cat.itens.length} {cat.itens.length > 1 ? 'transações' : 'transação'}
                      </Text>
                      <Text style={[estilos.categoriaPorcentagem, { color: catInfo.cor }]}>
                        {Math.round(porcentagem)}%
                      </Text>
                    </View>
                    {/* Barra de progresso */}
                    <View style={estilos.barraFundo}>
                      <View
                        style={[estilos.barraPreenchimento, {
                          width: `${porcentagem}%`,
                          backgroundColor: catInfo.cor,
                        }]}
                      />
                    </View>
                    {cat.pendentes > 0 && (
                      <Text style={estilos.categoriaPendente}>
                        {formatarMoeda(cat.pendentes)} pendente
                      </Text>
                    )}
                  </View>

                  {/* Chevron */}
                  <Feather
                    name={expandido ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={expandido ? catInfo.cor : CORES.textoSecundario}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                {/* Conteúdo Expandido */}
                {expandido && (
                  <View style={[estilos.accordionContent, { borderTopColor: cat.cor + '30' }]}>
                    {/* Resumo rápido no topo do expandido */}
                    <View style={estilos.resumoExpandido}>
                      <View style={estilos.resumoItem}>
                        <Text style={estilos.resumoLabel}>Total</Text>
                        <Text style={[estilos.resumoValor, { color: catInfo.cor }]}>{formatarMoeda(cat.total)}</Text>
                      </View>
                      <View style={estilos.resumoSeparador} />
                      <View style={estilos.resumoItem}>
                        <Text style={estilos.resumoLabel}>Transações</Text>
                        <Text style={estilos.resumoValor}>{cat.itens.length}</Text>
                      </View>
                      <View style={estilos.resumoSeparador} />
                      <View style={estilos.resumoItem}>
                        <Text style={estilos.resumoLabel}>% do total</Text>
                        <Text style={[estilos.resumoValor, { color: catInfo.cor }]}>{Math.round(porcentagem)}%</Text>
                      </View>
                      {cat.pendentes > 0 && (
                        <>
                          <View style={estilos.resumoSeparador} />
                          <View style={estilos.resumoItem}>
                            <Text style={estilos.resumoLabel}>Pendente</Text>
                            <Text style={[estilos.resumoValor, { color: '#E67E22' }]}>{formatarMoeda(cat.pendentes)}</Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Lista de transações */}
                    {cat.itens.map((transacao, index) => (
                      <View
                        key={transacao.id}
                        style={[estilos.itemWrapper, index < cat.itens.length - 1 && estilos.bordaItem]}
                      >
                        <ItemTransacao
                          transacao={transacao}
                          mostrarBadge={false}
                          aoClicar={() => navigation.navigate('DetalhesTransacao', { transacao })}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const criarEstilos = (CORES, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ESPACAMENTOS.l || 20,
    backgroundColor: CORES.branco,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    paddingTop: (insets?.top || 0) + (ESPACAMENTOS.l || 20),
  },
  botaoVoltar: { width: 40, height: 40, justifyContent: 'center' },
  headerTexto: { alignItems: 'center' },
  titulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal },
  headerSubtitulo: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginTop: 2 },
  conteudo: { padding: ESPACAMENTOS.margemHorizontal, paddingBottom: 100 },
  accordionContainer: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.paddingCard - 4,
    paddingVertical: 14,
  },
  iconeCategoria: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  accordionMiddle: { flex: 1 },
  accordionLinhaTopo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 2,
  },
  accordionLinhaInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  categoriaNome: { ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal, fontSize: 15 },
  categoriaTotal: { ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal, fontSize: 14 },
  categoriaQtd: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario },
  categoriaPorcentagem: { ...TIPOGRAFIA.legenda, fontSize: 12 },
  barraFundo: {
    height: 4, backgroundColor: CORES.borda, borderRadius: 2, overflow: 'hidden',
  },
  barraPreenchimento: { height: 4, borderRadius: 2 },
  categoriaPendente: {
    ...TIPOGRAFIA.legenda, color: '#E67E22', marginTop: 4,
  },
  accordionContent: {
    backgroundColor: CORES.fundo,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 8,
  },
  resumoExpandido: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoLabel: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginBottom: 2 },
  resumoValor: { ...TIPOGRAFIA.corpoPequeno, color: CORES.textoPrincipal },
  resumoSeparador: { width: 1, height: 28, backgroundColor: CORES.borda },
  itemWrapper: { paddingVertical: 4 },
  bordaItem: {
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    marginBottom: 4,
  },
  vazioContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  vazioTexto: { ...TIPOGRAFIA.corpo, color: CORES.textoSecundario, marginTop: 16 },
});
