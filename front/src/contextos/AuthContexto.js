/**
 * ============================================================
 * AUTH_CONTEXTO.JS — Estado Global de Autenticação
 * ============================================================
 * 
 * Provider que centraliza o estado de autenticação do app.
 * Usa Context API para gerenciar:
 * 
 * - Sessão do usuário autenticado via Telegram
 * - Persistência de sessão com AsyncStorage
 * - Token de sessão retornado pelo backend (v5.py)
 * - Login / Logout / Verificação de sessão existente
 * 
 * O backend valida o hash do Telegram (HMAC-SHA256) para garantir
 * que a autenticação é legítima e não foi forjada.
 * 
 * Uso nos componentes:
 *   const { usuario, logado, login, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===========================================
// CHAVES DE ARMAZENAMENTO LOCAL
// ===========================================

/** Chaves usadas no AsyncStorage para persistir a sessão */
const STORAGE_KEYS = {
  /** Token de sessão retornado pelo backend após login */
  TOKEN_SESSAO: '@zentrix_token_sessao',
  /** ID interno do usuário (Telegram ID usado como user_id no banco) */
  USER_ID: '@zentrix_user_id',
  /** Nome do usuário (first_name do Telegram) */
  NOME_USUARIO: '@zentrix_nome_usuario',
};

// ===========================================
// CRIAÇÃO DO CONTEXTO
// ===========================================

/** Contexto React para compartilhar estado de autenticação */
const AuthContexto = createContext(null);

// ===========================================
// PROVIDER (componente wrapper)
// ===========================================

/**
 * Provider que envolve o app e disponibiliza o estado de autenticação.
 * Deve ser colocado no topo da árvore de componentes (App.js),
 * envolvendo o TransacoesProvider.
 * 
 * @example
 * <AuthProvider>
 *   <TransacoesProvider>
 *     <NavegacaoPrincipal />
 *   </TransacoesProvider>
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  /** Dados do usuário logado */
  const [usuario, setUsuario] = useState(null);
  /** Indica se está verificando sessão existente no AsyncStorage */
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  // -------------------------------------------
  // Verificação de sessão existente ao abrir o app
  // -------------------------------------------
  useEffect(() => {
    verificarSessaoExistente();
  }, []);

  /**
   * Verifica se existe uma sessão salva no AsyncStorage.
   * Chamado automaticamente quando o app abre.
   * Se existir, restaura o estado do usuário sem precisar logar novamente.
   */
  const verificarSessaoExistente = async () => {
    try {
      const [tokenSessao, userId, nomeUsuario] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_SESSAO),
        AsyncStorage.getItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.NOME_USUARIO),
      ]);

      if (tokenSessao && userId) {
        setUsuario({
          token_sessao: tokenSessao,
          user_id: userId,
          nome: nomeUsuario || 'Usuário',
        });
      }
    } catch (erro) {
      console.error('[Auth] Erro ao verificar sessão existente:', erro.message);
    } finally {
      setVerificandoSessao(false);
    }
  };

  /**
   * Realiza o login salvando os dados retornados pelo backend.
   * 
   * O backend (v5.py, CASO 2) retorna:
   * {
   *   login: true,
   *   token_sessao: "uuid-gerado",
   *   user_id_interno: "telegram_id",
   *   nome: "first_name"
   * }
   * 
   * @param {object} dadosLogin - Dados retornados pelo backend após validação do hash do Telegram
   */
  const login = useCallback(async (dadosLogin) => {
    try {
      const { token_sessao, user_id_interno, nome } = dadosLogin;

      // Persiste a sessão localmente
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_SESSAO, token_sessao),
        AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user_id_interno),
        AsyncStorage.setItem(STORAGE_KEYS.NOME_USUARIO, nome || 'Usuário'),
      ]);

      // Atualiza o estado em memória
      setUsuario({
        token_sessao,
        user_id: user_id_interno,
        nome: nome || 'Usuário',
      });

      return true;
    } catch (erro) {
      console.error('[Auth] Erro ao salvar sessão:', erro.message);
      return false;
    }
  }, []);

  /**
   * Realiza o logout, limpando todos os dados de sessão.
   */
  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_SESSAO),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.NOME_USUARIO),
      ]);
      setUsuario(null);
    } catch (erro) {
      console.error('[Auth] Erro ao fazer logout:', erro.message);
    }
  }, []);

  /** Valor exposto pelo contexto para todos os componentes filhos */
  const valor = {
    /** Dados do usuário logado (null se deslogado) */
    usuario,
    /** true se o usuário está autenticado */
    logado: !!usuario,
    /** true enquanto verifica se há sessão salva */
    verificandoSessao,
    /** Função para logar com os dados retornados pelo backend */
    login,
    /** Função para deslogar */
    logout,
  };

  return (
    <AuthContexto.Provider value={valor}>
      {children}
    </AuthContexto.Provider>
  );
};

// ===========================================
// HOOK PERSONALIZADO
// ===========================================

/**
 * Hook para acessar o contexto de autenticação em qualquer componente.
 * 
 * @returns {{
 *   usuario: object|null,
 *   logado: boolean,
 *   verificandoSessao: boolean,
 *   login: Function,
 *   logout: Function
 * }}
 * 
 * @example
 * const { usuario, logado, logout } = useAuth();
 * // usuario.user_id → Telegram ID usado em todas as chamadas à API
 * // usuario.nome → Nome do usuário para exibir na saudação
 */
export const useAuth = () => {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return contexto;
};
