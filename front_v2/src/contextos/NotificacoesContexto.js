/**
 * ============================================================
 * NOTIFICACOES_CONTEXTO.JS — Estado Global de Notificações
 * ============================================================
 *
 * Gerencia o estado de notificações do app:
 * - Lê transações do TransacoesContexto automaticamente
 * - Persiste o estado de "lido/não lido" no AsyncStorage
 * - Expõe contagem de não lidos para o badge na tab/header
 * - Permite marcar uma ou todas como lidas
 * - Dispara push notifications locais no celular via expo-notifications
 *   quando novas transações são detectadas
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { formatarMoeda, formatarHora } from '../utilitarios/formatadores';
import { useTransacoes } from './TransacoesContexto';

// ============================================================
// CONFIGURAÇÃO GLOBAL DO HANDLER DE NOTIFICAÇÕES
// Define como o app se comporta ao receber uma notificação
// enquanto está em primeiro plano (som + badge + banner)
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const STORAGE_KEY = '@zentrix_notificacoes_lidas';
const NotificacoesContexto = createContext(null);

// ============================================================
// NOTIFICAÇÕES FIXAS DE SISTEMA (não disparam push)
// ============================================================
const NOTIFICACOES_SISTEMA = [
  {
    id: 'sys-1', tipo: 'Alertas', icone: 'alert-triangle',
    corIcone: CORES_SEMANTICAS.erro,
    titulo: 'Alerta de orçamento',
    descricao: 'Você ultrapassou 90% do orçamento de uma categoria.',
    horario: 'Ontem\n21:30',
  },
  {
    id: 'sys-2', tipo: 'Alertas', icone: 'trending-up',
    corIcone: CORES_SEMANTICAS.sucesso,
    titulo: 'Meta quase alcançada!',
    descricao: 'Você já atingiu 80% da sua meta este mês.',
    horario: '09:15',
  },
  {
    id: 'sys-3', tipo: 'Sistema', icone: 'bar-chart-2',
    corIcone: '#8E44AD',
    titulo: 'Relatório disponível',
    descricao: 'Seu relatório mensal já está disponível.',
    horario: '07 Mai\n19:45',
  },
  {
    id: 'sys-4', tipo: 'Sistema', icone: 'shield',
    corIcone: '#274C77',
    titulo: 'Segurança',
    descricao: 'Novo acesso identificado no seu dispositivo.',
    horario: '06 Mai\n14:20',
  },
  {
    id: 'sys-5', tipo: 'Sistema', icone: 'zap',
    corIcone: '#4471A0',
    titulo: 'Novidade no Zentrix',
    descricao: 'Agora você pode conectar sua conta de investimentos!',
    horario: '05 Mai\n11:10',
  },
];

const gerarNotificacoesDasTransacoes = (transacoes) =>
  transacoes.slice(0, 8).map((t) => ({
    id: `trans-${t.id}`,
    tipo: 'Transações',
    icone: t.amount < 0 ? 'shopping-cart' : 'dollar-sign',
    corIcone: t.amount < 0 ? CORES_SEMANTICAS.erro : CORES_SEMANTICAS.sucesso,
    titulo: t.amount < 0 ? 'Nova despesa registrada' : 'Nova receita registrada',
    descricao: `${t.description} — ${formatarMoeda(Math.abs(t.amount))}`,
    horario: formatarHora(t.created_at),
  }));

// ============================================================
// FUNÇÕES DE PUSH NOTIFICATION LOCAL
// ============================================================

/**
 * Solicita permissão de notificação ao usuário.
 * Retorna true se a permissão foi concedida, false caso contrário.
 * No Android, também cria o canal de notificação.
 */
async function solicitarPermissaoNotificacao() {
  // Android: cria o canal antes de pedir permissão
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('zentrix-transacoes', {
      name: 'Transações',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#274C77',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('zentrix-alertas', {
      name: 'Alertas',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const { status: statusExistente } = await Notifications.getPermissionsAsync();
  if (statusExistente === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Dispara uma notificação local imediata no sistema operacional.
 *
 * @param {string} titulo - Título da notificação
 * @param {string} corpo - Corpo da notificação
 * @param {object} dados - Dados extras (ex: id da transação)
 * @param {string} canal - Canal Android: 'zentrix-transacoes' | 'zentrix-alertas'
 */
async function dispararNotificacaoLocal(titulo, corpo, dados = {}, canal = 'zentrix-transacoes') {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpo,
        data: dados,
        sound: 'default',
        // Badge será gerenciado pelo setNotificationHandler
      },
      trigger: null, // null = imediato
      ...(Platform.OS === 'android' ? { channelId: canal } : {}),
    });
  } catch (err) {
    console.warn('[Zentrix] Falha ao disparar notificação local:', err);
  }
}

// ============================================================
// PROVIDER
// ============================================================
export const NotificacoesProvider = ({ children }) => {
  const [idsLidos, setIdsLidos] = useState(new Set());
  const [permissaoConcedida, setPermissaoConcedida] = useState(false);
  const { transacoes } = useTransacoes();
  const prevIdsRef = useRef(new Set());
  // Controla se é a primeira carga (não dispara push no boot)
  const primeiraCarregaRef = useRef(true);

  // ----------------------------------------------------------
  // 1. Solicita permissão ao montar o provider
  // ----------------------------------------------------------
  useEffect(() => {
    solicitarPermissaoNotificacao().then((concedida) => {
      setPermissaoConcedida(concedida);
    });
  }, []);

  // ----------------------------------------------------------
  // 2. Carrega IDs lidos salvos no AsyncStorage
  // ----------------------------------------------------------
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((salvo) => {
      if (salvo) setIdsLidos(new Set(JSON.parse(salvo)));
    }).catch(() => {});
  }, []);

  // ----------------------------------------------------------
  // 3. Detecta novas transações e dispara push no celular
  // ----------------------------------------------------------
  useEffect(() => {
    const idsAtuais = new Set(transacoes.map((t) => `trans-${t.id}`));
    const idsNovos = [...idsAtuais].filter((id) => !prevIdsRef.current.has(id));

    if (idsNovos.length > 0) {
      // Marca como não lidos no estado interno
      setIdsLidos((prev) => {
        const novo = new Set(prev);
        idsNovos.forEach((id) => novo.delete(id));
        return novo;
      });

      // Dispara push SOMENTE após a primeira carga
      // (evita spam de notificações ao abrir o app)
      if (!primeiraCarregaRef.current && permissaoConcedida) {
        const transacoesNovas = transacoes.filter((t) =>
          idsNovos.includes(`trans-${t.id}`)
        );

        if (transacoesNovas.length === 1) {
          // Notificação individual com detalhes
          const t = transacoesNovas[0];
          const isGasto = parseFloat(t.amount) < 0;
          dispararNotificacaoLocal(
            isGasto ? '💸 Nova despesa registrada' : '💰 Nova receita registrada',
            `${t.description} — ${formatarMoeda(Math.abs(parseFloat(t.amount)))}`,
            { transacaoId: t.id, tipo: 'transacao' },
            'zentrix-transacoes'
          );
        } else if (transacoesNovas.length > 1) {
          // Notificação agrupada
          dispararNotificacaoLocal(
            '📊 Zentrix atualizado',
            `${transacoesNovas.length} novas transações foram registradas.`,
            { tipo: 'lote' },
            'zentrix-transacoes'
          );
        }
      }
    }

    // Após o primeiro ciclo, desliga a flag
    if (primeiraCarregaRef.current && transacoes.length > 0) {
      primeiraCarregaRef.current = false;
    }

    prevIdsRef.current = idsAtuais;
  }, [transacoes, permissaoConcedida]);

  // ----------------------------------------------------------
  // Helpers para marcar como lido
  // ----------------------------------------------------------
  const salvarLidos = useCallback((novosLidos) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...novosLidos])).catch(() => {});
  }, []);

  const marcarComoLida = useCallback((id) => {
    setIdsLidos((prev) => {
      const novo = new Set(prev);
      novo.add(id);
      salvarLidos(novo);
      return novo;
    });
  }, [salvarLidos]);

  const marcarTodasComoLidas = useCallback(() => {
    const todos = new Set([
      ...gerarNotificacoesDasTransacoes(transacoes).map((n) => n.id),
      ...NOTIFICACOES_SISTEMA.map((n) => n.id),
    ]);
    setIdsLidos(todos);
    salvarLidos(todos);
    // Limpa o badge do ícone do app
    Notifications.setBadgeCountAsync(0).catch(() => {});
  }, [transacoes, salvarLidos]);

  // ----------------------------------------------------------
  // Monta a lista de notificações com flag naoLido
  // ----------------------------------------------------------
  const notificacoes = [
    ...gerarNotificacoesDasTransacoes(transacoes),
    ...NOTIFICACOES_SISTEMA,
  ].map((n) => ({ ...n, naoLido: !idsLidos.has(n.id) }));

  const naoLidosCount = notificacoes.filter((n) => n.naoLido).length;

  // Sincroniza badge do ícone do app com a contagem de não lidos
  useEffect(() => {
    if (permissaoConcedida) {
      Notifications.setBadgeCountAsync(naoLidosCount).catch(() => {});
    }
  }, [naoLidosCount, permissaoConcedida]);

  return (
    <NotificacoesContexto.Provider
      value={{
        notificacoes,
        naoLidosCount,
        marcarComoLida,
        marcarTodasComoLidas,
        permissaoConcedida,
        dispararNotificacaoLocal, // exposto para uso externo (ex: alerta de orçamento)
      }}
    >
      {children}
    </NotificacoesContexto.Provider>
  );
};

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContexto);
  if (!ctx) throw new Error('useNotificacoes deve ser usado dentro de um <NotificacoesProvider>');
  return ctx;
};
