/**
 * ============================================================
 * CARTAO_RESUMO.JS — Card de Resumo Financeiro
 * ============================================================
 * 
 * Card compacto usado para exibir métricas financeiras.
 * Aparece na Tela Inicial (Total Gasto, Limite) e 
 * na Tela de Relatórios (Total Gasto, Total Recebido, Saldo, Média).
 * 
 * Layout: [Ícone]  Label
 *                  Valor
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';

/**
 * Card de resumo com ícone, label e valor monetário.
 * 
 * @param {string} icone - Nome do ícone Feather (ex: "dollar-sign")
 * @param {string} label - Texto descritivo (ex: "Total Gasto")
 * @param {string} valor - Valor formatado (ex: "R$ 235,01")
 * @param {string} corValor - Cor do texto do valor (padrão: textoPrincipal)
 * @param {string} corIcone - Cor do ícone e seu fundo (padrão: principal)
 */
const CartaoResumo = ({ icone, label, valor, corValor, corIcone }) => {
  const corDoIcone = corIcone || CORES.principal;

  return (
    <View style={estilos.container}>
      {/* Ícone circular com fundo colorido */}
      <View style={[estilos.containerIcone, { backgroundColor: `${corDoIcone}15` }]}>
        <Feather name={icone} size={22} color={corDoIcone} />
      </View>

      {/* Textos: label + valor */}
      <View style={estilos.containerTexto}>
        <Text style={estilos.label}>{label}</Text>
        <Text style={[estilos.valor, corValor && { color: corValor }]}>{valor}</Text>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard - 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    /* Sombra sutil */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  containerTexto: {
    flex: 1,
  },
  label: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginBottom: 2,
  },
  valor: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
  },
});

export default CartaoResumo;
