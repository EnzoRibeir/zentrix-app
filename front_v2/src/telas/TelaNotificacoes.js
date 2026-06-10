/**
 * ============================================================
 * TELA_NOTIFICACOES.JS — Tela de Notificações
 * ============================================================
 *
 * Exibe a lista de notificações do usuário com:
 * - Abas de filtro: Todas / Transações / Alertas / Sistema
 * - Notificações geradas a partir das transações reais
 * - Indicador de não lido (bolinha azul) que some ao tocar
 * - Botão "Marcar todas como lidas"
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { useNotificacoes } from '../contextos/NotificacoesContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import FiltroAbas from '../componentes/FiltroAbas';
import ItemNotificacao from '../componentes/ItemNotificacao';

const ABAS_FILTRO = ['Todas', 'Transações', 'Alertas', 'Sistema'];

const TelaNotificacoes = ({ navigation }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);
  const { notificacoes, naoLidosCount, marcarTodasComoLidas } = useNotificacoes();

  const [filtroAtivo, setFiltroAtivo] = useState('Todas');

  const notificacoesFiltradas = useMemo(() => {
    if (filtroAtivo === 'Todas') return notificacoes;
    return notificacoes.filter((n) => n.tipo === filtroAtivo);
  }, [notificacoes, filtroAtivo]);

  return (
    <View style={estilos.container}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Feather name="arrow-left" size={24} color={CORES.textoPrincipal} />
        </TouchableOpacity>
        <View>
          <Text style={estilos.titulo}>Notificações</Text>
          {naoLidosCount > 0 && (
            <Text style={estilos.subtituloNaoLido}>{naoLidosCount} não lida{naoLidosCount > 1 ? 's' : ''}</Text>
          )}
        </View>
        <TouchableOpacity
          style={estilos.iconeBotao}
          onPress={marcarTodasComoLidas}
          disabled={naoLidosCount === 0}
        >
          <Feather
            name="check-circle"
            size={22}
            color={naoLidosCount > 0 ? CORES.principal : CORES.textoSecundario}
          />
        </TouchableOpacity>
      </View>

      {/* Abas de filtro */}
      <View style={estilos.containerFiltro}>
        <FiltroAbas
          abas={ABAS_FILTRO}
          abaSelecionada={filtroAtivo}
          aoSelecionarAba={setFiltroAtivo}
        />
      </View>

      {/* Lista de notificações */}
      <ScrollView
        contentContainerStyle={estilos.listaConteudo}
        showsVerticalScrollIndicator={false}
      >
        {notificacoesFiltradas.length === 0 ? (
          <View style={estilos.semDados}>
            <Feather name="bell-off" size={48} color={CORES.textoSecundario} />
            <Text style={estilos.semDadosTexto}>Nenhuma notificação</Text>
          </View>
        ) : (
          notificacoesFiltradas.map((notif) => (
            <ItemNotificacao
              key={notif.id}
              id={notif.id}
              icone={notif.icone}
              corIcone={notif.corIcone}
              titulo={notif.titulo}
              descricao={notif.descricao}
              horario={notif.horario}
              naoLido={notif.naoLido}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: ESPACAMENTOS.margemHorizontal, paddingTop: 10, paddingBottom: 16,
  },
  botaoVoltar: { width: 40, height: 40, justifyContent: 'center' },
  titulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal },
  subtituloNaoLido: { ...TIPOGRAFIA.legenda, color: CORES.principal, marginTop: 2 },
  iconeBotao: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: CORES.branco,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  containerFiltro: { paddingHorizontal: ESPACAMENTOS.margemHorizontal },
  listaConteudo: {
    paddingHorizontal: ESPACAMENTOS.margemHorizontal, paddingBottom: 40,
  },
  semDados: { alignItems: 'center', paddingVertical: 60 },
  semDadosTexto: { ...TIPOGRAFIA.corpo, color: CORES.textoSecundario, marginTop: 16 },
});

export default TelaNotificacoes;
