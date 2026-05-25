/**
 * ============================================================
 * TRANSACOES_CONTEXTO.JS — Estado Global de Transações
 * ============================================================
 * 
 * Provider que centraliza o estado de transações do app.
 * Usa Context API + useReducer para gerenciar:
 * 
 * - Lista de transações (vindas da API)
 * - Estado de carregamento (loading)
 * - Mensagens de erro
 * - Ações: carregar, adicionar (via frase IA), excluir
 * 
 * Uso nos componentes:
 *   const { transacoes, carregando, carregar } = useTransacoes();
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { buscarTransacoes, criarTransacaoPorFrase, excluirTransacao, atualizarTransacao } from '../servicos/api';

// ===========================================
// TIPOS DE AÇÃO DO REDUCER
// ===========================================

/** Ações disponíveis para alterar o estado global */
const ACOES = {
  /** Iniciou o carregamento de dados */
  INICIAR_CARREGAMENTO: 'INICIAR_CARREGAMENTO',
  /** Transações carregadas com sucesso */
  CARREGAR_SUCESSO: 'CARREGAR_SUCESSO',
  /** Ocorreu um erro na requisição */
  DEFINIR_ERRO: 'DEFINIR_ERRO',
  /** Uma transação foi adicionada com sucesso */
  ADICIONAR_TRANSACAO: 'ADICIONAR_TRANSACAO',
  /** Uma transação foi removida com sucesso */
  REMOVER_TRANSACAO: 'REMOVER_TRANSACAO',
};

// ===========================================
// ESTADO INICIAL
// ===========================================

const estadoInicial = {
  /** Lista de transações carregadas da API */
  transacoes: [],
  /** Dados do usuário carregados da API */
  usuario: null,
  /** Indica se está carregando dados (exibir spinner) */
  carregando: false,
  /** Mensagem de erro caso a requisição falhe */
  erro: null,
};

// ===========================================
// REDUCER (lógica de atualização do estado)
// ===========================================

/**
 * Reducer que processa as ações e retorna o novo estado.
 * Cada case retorna um novo objeto (imutabilidade).
 */
const transacoesReducer = (estado, acao) => {
  switch (acao.type) {
    case ACOES.INICIAR_CARREGAMENTO:
      return { ...estado, carregando: true, erro: null };

    case ACOES.CARREGAR_SUCESSO:
      return { 
        ...estado, 
        transacoes: acao.payload.transacoes, 
        usuario: acao.payload.usuario,
        carregando: false, 
        erro: null 
      };

    case ACOES.DEFINIR_ERRO:
      return { ...estado, carregando: false, erro: acao.payload };

    case ACOES.ADICIONAR_TRANSACAO:
      // Adiciona no início da lista (mais recente primeiro)
      return { ...estado, transacoes: [acao.payload, ...estado.transacoes] };

    case ACOES.REMOVER_TRANSACAO:
      return {
        ...estado,
        transacoes: estado.transacoes.filter((t) => t.id !== acao.payload),
      };

    default:
      return estado;
  }
};

// ===========================================
// CRIAÇÃO DO CONTEXTO
// ===========================================

/** Contexto React para compartilhar estado de transações */
const TransacoesContexto = createContext(null);

// ===========================================
// PROVIDER (componente wrapper)
// ===========================================

/**
 * Provider que envolve o app e disponibiliza o estado de transações.
 * Deve ser colocado no topo da árvore de componentes (App.js).
 * 
 * @example
 * <TransacoesProvider>
 *   <NavegacaoPrincipal />
 * </TransacoesProvider>
 */
export const TransacoesProvider = ({ children }) => {
  const [estado, despachar] = useReducer(transacoesReducer, estadoInicial);

  /**
   * Carrega todas as transações da API.
   * Chamado na montagem da tela inicial e no pull-to-refresh.
   */
  const carregar = useCallback(async () => {
    despachar({ type: ACOES.INICIAR_CARREGAMENTO });
    try {
      const dados = await buscarTransacoes();
      despachar({ type: ACOES.CARREGAR_SUCESSO, payload: dados });
    } catch (erro) {
      despachar({ type: ACOES.DEFINIR_ERRO, payload: erro.message });
    }
  }, []);

  /**
   * Adiciona uma nova transação enviando uma frase para a IA processar.
   * Após criar, recarrega a lista completa para garantir consistência.
   * 
   * @param {string} frase - Frase descrevendo a transação
   * @returns {Promise<boolean>} true se criou com sucesso, false se houve erro
   */
  const adicionar = useCallback(async (frase) => {
    try {
      await criarTransacaoPorFrase(frase);
      // Recarrega a lista completa após criar (para pegar o ID gerado pelo banco)
      await carregar();
      return true;
    } catch (erro) {
      despachar({ type: ACOES.DEFINIR_ERRO, payload: erro.message });
      return false;
    }
  }, [carregar]);

  /**
   * Exclui uma transação pelo ID.
   * Remove otimisticamente da lista local e confirma com a API.
   * 
   * @param {number} idTransacao - ID da transação a ser excluída
   * @returns {Promise<boolean>} true se excluiu com sucesso
   */
  const remover = useCallback(async (idTransacao) => {
    try {
      // Remoção otimista: remove da lista local antes de confirmar com a API
      despachar({ type: ACOES.REMOVER_TRANSACAO, payload: idTransacao });
      await excluirTransacao(idTransacao);
      return true;
    } catch (erro) {
      // Se falhou, recarrega a lista para restaurar o item
      await carregar();
      despachar({ type: ACOES.DEFINIR_ERRO, payload: 'Erro ao excluir transação' });
      return false;
    }
  }, [carregar]);

  const atualizar = useCallback(async (id, campos) => {
    try {
      await atualizarTransacao(id, campos);
      await carregar(); // recarrega a lista para pegar o novo status
      return true;
    } catch (erro) {
      despachar({ type: ACOES.DEFINIR_ERRO, payload: 'Erro ao atualizar transação' });
      return false;
    }
  }, [carregar]);

  /** Valor exposto pelo contexto para todos os componentes filhos */
  const valor = {
    transacoes: estado.transacoes,
    usuario: estado.usuario,
    carregando: estado.carregando,
    erro: estado.erro,
    carregar,
    adicionar,
    remover,
    atualizar,
  };

  return (
    <TransacoesContexto.Provider value={valor}>
      {children}
    </TransacoesContexto.Provider>
  );
};

// ===========================================
// HOOK PERSONALIZADO
// ===========================================

/**
 * Hook para acessar o contexto de transações em qualquer componente.
 * 
 * @returns {{ 
 *   transacoes: Array, 
 *   carregando: boolean, 
 *   erro: string|null,
 *   carregar: Function,
 *   adicionar: Function,
 *   remover: Function
 * }}
 * 
 * @example
 * const { transacoes, carregando, carregar } = useTransacoes();
 */
export const useTransacoes = () => {
  const contexto = useContext(TransacoesContexto);
  if (!contexto) {
    throw new Error('useTransacoes deve ser usado dentro de um <TransacoesProvider>');
  }
  return contexto;
};
