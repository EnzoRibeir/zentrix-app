/**
 * ============================================================
 * FILTRO_ABAS.JS — Componente de Abas/Tabs
 * ============================================================
 * 
 * Renderiza abas horizontais para filtrar conteúdo.
 * Usado em: TelaTransacoes (Todas/Entradas/Saídas),
 *           TelaNotificacoes (Todas/Transações/Alertas/Sistema),
 *           TelaRelatorios (Este mês/Últimos 3 meses/Este ano).
 * 
 * Comportamento: Apenas uma aba pode estar selecionada por vez.
 * A aba selecionada tem fundo azul escuro (#274C77) e texto branco.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CORES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';

/**
 * Abas horizontais para filtragem de conteúdo.
 * 
 * @param {Array<string>} abas - Lista de labels das abas
 * @param {string} abaSelecionada - Label da aba ativa
 * @param {function} aoSelecionarAba - Callback com o label da aba clicada
 * 
 * @example
 * <FiltroAbas
 *   abas={['Todas', 'Entradas', 'Saídas']}
 *   abaSelecionada={filtroAtivo}
 *   aoSelecionarAba={setFiltroAtivo}
 * />
 */
const FiltroAbas = ({ abas, abaSelecionada, aoSelecionarAba }) => {
  return (
    <View style={estilos.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.scrollConteudo}
      >
        {abas.map((aba) => {
          const estaSelecionada = aba === abaSelecionada;
          return (
            <TouchableOpacity
              key={aba}
              style={[
                estilos.aba,
                estaSelecionada && estilos.abaSelecionada,
              ]}
              onPress={() => aoSelecionarAba(aba)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  estilos.abaTexto,
                  estaSelecionada && estilos.abaTextoSelecionado,
                ]}
              >
                {aba}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBordaCompleto,
    padding: 4,
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    /* Sombra sutil */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scrollConteudo: {
    flexDirection: 'row',
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: ESPACAMENTOS.raioBordaCompleto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abaSelecionada: {
    backgroundColor: CORES.principal,
  },
  abaTexto: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
  },
  abaTextoSelecionado: {
    color: CORES.branco,
  },
});

export default FiltroAbas;
