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
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { formatarMoeda, formatarHora } from '../utilitarios/formatadores';
import { useTransacoes } from './TransacoesContexto';

const STORAGE_KEY = '@zentrix_notificacoes_lidas';
const NotificacoesContexto = createContext(null);

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

export const NotificacoesProvider = ({ children }) => {
  const [idsLidos, setIdsLidos] = useState(new Set());
  const { transacoes } = useTransacoes();
  const prevIdsRef = useRef(new Set());

  // Carrega lidos salvos
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((salvo) => {
      if (salvo) setIdsLidos(new Set(JSON.parse(salvo)));
    }).catch(() => {});
  }, []);

  // Novas transações = novas notificações não lidas
  useEffect(() => {
    const idsAtuais = new Set(transacoes.map((t) => `trans-${t.id}`));
    const idsNovos = [...idsAtuais].filter((id) => !prevIdsRef.current.has(id));
    if (idsNovos.length > 0) {
      setIdsLidos((prev) => {
        const novo = new Set(prev);
        idsNovos.forEach((id) => novo.delete(id));
        return novo;
      });
    }
    prevIdsRef.current = idsAtuais;
  }, [transacoes]);

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
  }, [transacoes, salvarLidos]);

  const notificacoes = [
    ...gerarNotificacoesDasTransacoes(transacoes),
    ...NOTIFICACOES_SISTEMA,
  ].map((n) => ({ ...n, naoLido: !idsLidos.has(n.id) }));

  const naoLidosCount = notificacoes.filter((n) => n.naoLido).length;

  return (
    <NotificacoesContexto.Provider value={{ notificacoes, naoLidosCount, marcarComoLida, marcarTodasComoLidas }}>
      {children}
    </NotificacoesContexto.Provider>
  );
};

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContexto);
  if (!ctx) throw new Error('useNotificacoes deve ser usado dentro de um <NotificacoesProvider>');
  return ctx;
};
