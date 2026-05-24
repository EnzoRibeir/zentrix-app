/**
 * ============================================================
 * TELA_NOTIFICACOES.JS — Tela de Notificações
 * ============================================================
 * 
 * Exibe a lista de notificações do usuário com:
 * - Abas de filtro: Todas / Transações / Alertas / Sistema
 * - Notificações geradas a partir das transações reais
 * - Indicador de não lido (bolinha azul)
 * 
 * Dados: Notificações são geradas localmente a partir das 
 * transações reais + notificações de sistema mockadas.
 * TODO: Futuramente terá endpoint próprio no backend.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES, CORES_SEMANTICAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { formatarMoeda, formatarHora, formatarDataCurta } from '../utilitarios/formatadores';
import FiltroAbas from '../componentes/FiltroAbas';
import ItemNotificacao from '../componentes/ItemNotificacao';

/** Abas de filtro disponíveis */
const ABAS_FILTRO = ['Todas', 'Transações', 'Alertas', 'Sistema'];

/**
 * Gera notificações automaticamente a partir das transações reais.
 * Cada transação gera uma notificação de "Transação realizada".
 * 
 * @param {Array} transacoes - Lista de transações da API
 * @returns {Array} Lista de notificações formatadas
 */
const gerarNotificacoes = (transacoes) => {
  // Notificações baseadas em transações reais
  const notificacoesTransacoes = transacoes.slice(0, 5).map((t, i) => ({
    id: `trans-${t.id}`,
    tipo: 'Transações',
    icone: 'shopping-cart',
    corIcone: CORES.textoSecundario,
    titulo: 'Transação realizada',
    descricao: `Você gastou ${formatarMoeda(t.amount)} em ${t.description}.`,
    horario: formatarHora(t.created_at),
    naoLido: i < 3,
  }));

  // Notificações de sistema mockadas
  const notificacoesSistema = [
    {
      id: 'sys-1',
      tipo: 'Alertas',
      icone: 'alert-triangle',
      corIcone: CORES_SEMANTICAS.erro,
      titulo: 'Alerta de orçamento',
      descricao: 'Você ultrapassou 90% do orçamento de uma categoria.',
      horario: 'Ontem\n21:30',
      naoLido: true,
    },
    {
      id: 'sys-2',
      tipo: 'Alertas',
      icone: 'trending-up',
      corIcone: CORES_SEMANTICAS.sucesso,
      titulo: 'Meta quase alcançada!',
      descricao: 'Você já atingiu 80% da sua meta este mês.',
      horario: '09:15',
      naoLido: true,
    },
    {
      id: 'sys-3',
      tipo: 'Sistema',
      icone: 'bar-chart-2',
      corIcone: '#8E44AD',
      titulo: 'Relatório disponível',
      descricao: 'Seu relatório mensal já está disponível.',
      horario: '07 Mai\n19:45',
      naoLido: false,
    },
    {
      id: 'sys-4',
      tipo: 'Sistema',
      icone: 'shield',
      corIcone: CORES.principal,
      titulo: 'Segurança',
      descricao: 'Novo acesso identificado no seu dispositivo.',
      horario: '06 Mai\n14:20',
      naoLido: false,
    },
    {
      id: 'sys-5',
      tipo: 'Sistema',
      icone: 'zap',
      corIcone: CORES.secundaria,
      titulo: 'Novidade no Zentrix',
      descricao: 'Agora você pode conectar sua conta de investimentos!',
      horario: '05 Mai\n11:10',
      naoLido: false,
    },
  ];

  return [...notificacoesTransacoes, ...notificacoesSistema];
};

/**
 * Tela de listagem de notificações.
 * 
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaNotificacoes = ({ navigation }) => {
  const { transacoes } = useTransacoes();
  const [filtroAtivo, setFiltroAtivo] = useState('Todas');

  /** Gera notificações e filtra pela aba selecionada */
  const notificacoes = useMemo(() => {
    const todas = gerarNotificacoes(transacoes);
    if (filtroAtivo === 'Todas') return todas;
    return todas.filter((n) => n.tipo === filtroAtivo);
  }, [transacoes, filtroAtivo]);

  return (
    <View style={estilos.container}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Feather name="arrow-left" size={24} color={CORES.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.titulo}>Notificações</Text>
        <TouchableOpacity style={estilos.iconeBotao}>
          <Feather name="settings" size={22} color={CORES.principal} />
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
        {notificacoes.length === 0 ? (
          <View style={estilos.semDados}>
            <Feather name="bell-off" size={48} color={CORES.textoSecundario} />
            <Text style={estilos.semDadosTexto}>Nenhuma notificação</Text>
          </View>
        ) : (
          notificacoes.map((notif) => (
            <ItemNotificacao
              key={notif.id}
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

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: ESPACAMENTOS.margemHorizontal, paddingTop: 10, paddingBottom: 16,
  },
  botaoVoltar: { width: 40, height: 40, justifyContent: 'center' },
  titulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal },
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
