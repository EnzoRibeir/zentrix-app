import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { useTema } from '../contextos/TemaContexto';
import { CORES_CATEGORIAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { formatarMoeda } from '../utilitarios/formatadores';
import ItemTransacao from '../componentes/ItemTransacao';
import CarregandoIndicador from '../componentes/CarregandoIndicador';

// Habilita LayoutAnimation no Android
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

  // Auto-expandir caso venha do gráfico
  useEffect(() => {
    if (categoriaInicial) {
      setCategoriaExpandida(categoriaInicial);
    }
  }, [categoriaInicial]);

  if (carregando && transacoes.length === 0) {
    return <CarregandoIndicador />;
  }

  // Agrupa transações por categoria
  const categoriasAgrupadas = {};
  transacoes.forEach(t => {
    // Se for tipo "Emprestado", agrupamos como "A receber"
    const cat = t.type === 'Emprestado' ? 'A receber' : (t.category || 'Outros');
    if (!categoriasAgrupadas[cat]) {
      categoriasAgrupadas[cat] = {
        nome: cat,
        itens: [],
        total: 0,
        cor: CORES_CATEGORIAS[cat] || CORES_CATEGORIAS['Outros'],
        pendentes: 0
      };
    }
    categoriasAgrupadas[cat].itens.push(t);
    categoriasAgrupadas[cat].total += parseFloat(t.amount || 0);

    if (t.type === 'Emprestado' && (!t.status || t.status === 'PENDING')) {
      categoriasAgrupadas[cat].pendentes += parseFloat(t.amount || 0);
    }
  });

  // Converte para array e ordena por total (maior primeiro)
  const listaCategorias = Object.values(categoriasAgrupadas).sort((a, b) => b.total - a.total);

  const toggleExpandir = (nomeCategoria) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategoriaExpandida(prev => prev === nomeCategoria ? null : nomeCategoria);
  };

  return (
    <View style={estilos.container}>
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Feather name="arrow-left" size={24} color={CORES.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.titulo}>Categorias</Text>
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
            return (
              <View key={cat.nome} style={estilos.accordionContainer}>
                {/* Cabeçalho do Accordion */}
                <TouchableOpacity 
                  style={[estilos.accordionHeader, expandido && estilos.accordionHeaderAtivo]} 
                  onPress={() => toggleExpandir(cat.nome)}
                  activeOpacity={0.7}
                >
                  <View style={estilos.accordionHeaderEsquerda}>
                    <View style={[estilos.bolinhaCor, { backgroundColor: cat.cor }]} />
                    <View>
                      <Text style={estilos.categoriaNome}>{cat.nome}</Text>
                      <Text style={estilos.categoriaQtd}>{cat.itens.length} transaç{cat.itens.length > 1 ? 'ões' : 'ão'}</Text>
                    </View>
                  </View>
                  <View style={estilos.accordionHeaderDireita}>
                    <View>
                      <Text style={estilos.categoriaTotal}>{formatarMoeda(cat.total)}</Text>
                      {cat.pendentes > 0 && (
                        <Text style={estilos.categoriaPendente}>
                          {formatarMoeda(cat.pendentes)} pendente
                        </Text>
                      )}
                    </View>
                    <Feather 
                      name={expandido ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={CORES.textoSecundario} 
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* Conteúdo Expandido */}
                {expandido && (
                  <View style={estilos.accordionContent}>
                    {cat.itens.map((transacao, index) => (
                      <View key={transacao.id} style={[
                        estilos.itemWrapper, 
                        index < cat.itens.length - 1 && estilos.bordaItem
                      ]}>
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
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ESPACAMENTOS.l,
    backgroundColor: CORES.branco,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    paddingTop: (insets?.top || 0) + ESPACAMENTOS.l,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
  },
  conteudo: {
    padding: ESPACAMENTOS.m,
    paddingBottom: 100,
  },
  accordionContainer: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    marginBottom: ESPACAMENTOS.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ESPACAMENTOS.m,
  },
  accordionHeaderAtivo: {
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    backgroundColor: `${CORES.fundoCard || CORES.fundo}50`,
  },
  accordionHeaderEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bolinhaCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoriaNome: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    fontFamily: TIPOGRAFIA.familias?.negrito || TIPOGRAFIA.corpo.fontFamily,
  },
  categoriaQtd: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  accordionHeaderDireita: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaTotal: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    textAlign: 'right',
  },
  categoriaPendente: {
    ...TIPOGRAFIA.legenda,
    color: CORES.secundaria,
    textAlign: 'right',
    marginTop: 2,
  },
  accordionContent: {
    backgroundColor: CORES.fundo,
    padding: ESPACAMENTOS.m,
  },
  itemWrapper: {
    paddingVertical: 4,
  },
  bordaItem: {
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    marginBottom: 4,
  },
  vazioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  vazioTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
    marginTop: 16,
  }
});
