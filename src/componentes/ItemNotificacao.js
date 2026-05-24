/**
 * ============================================================
 * ITEM_NOTIFICACAO.JS — Card de Notificação
 * ============================================================
 * 
 * Renderiza uma notificação individual na tela de notificações.
 * Cada notificação tem ícone, título, descrição, horário e 
 * indicador de não lido (bolinha azul).
 * 
 * Usado em: TelaNotificacoes.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';

/**
 * Card de notificação individual.
 * 
 * @param {string} icone - Nome do ícone Feather
 * @param {string} corIcone - Cor do ícone
 * @param {string} titulo - Título da notificação
 * @param {string} descricao - Texto descritivo
 * @param {string} horario - Horário/data da notificação
 * @param {boolean} naoLido - Se true, exibe indicador de não lido
 */
const ItemNotificacao = ({ icone, corIcone, titulo, descricao, horario, naoLido = false }) => {
  return (
    <TouchableOpacity style={estilos.container} activeOpacity={0.7}>
      {/* Ícone circular */}
      <View style={[estilos.containerIcone, { backgroundColor: `${corIcone}15` }]}>
        <Feather name={icone} size={22} color={corIcone} />
      </View>

      {/* Conteúdo central */}
      <View style={estilos.containerConteudo}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.descricao} numberOfLines={2}>{descricao}</Text>
      </View>

      {/* Horário + indicador não lido */}
      <View style={estilos.containerDireita}>
        <Text style={estilos.horario}>{horario}</Text>
        {naoLido && <View style={estilos.indicadorNaoLido} />}
      </View>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  containerIcone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  containerConteudo: {
    flex: 1,
    marginRight: 8,
  },
  titulo: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    marginBottom: 4,
  },
  descricao: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    lineHeight: 18,
  },
  containerDireita: {
    alignItems: 'flex-end',
  },
  horario: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginBottom: 8,
  },
  indicadorNaoLido: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CORES.destaque,
  },
});

export default ItemNotificacao;
