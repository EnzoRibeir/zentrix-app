/**
 * ============================================================
 * AUTH_CONTEXTO.JS — Estado Global de Autenticação
 * ============================================================
 *
 * Provider que centraliza o estado de autenticação do app.
 * Usa Context API para gerenciar:
 *
 * - Sessão do usuário autenticado via Telegram
 * - SEC05: Persistência com expo-secure-store (criptografado no Keychain/Keystore)
 * - Token de sessão retornado pelo backend
 * - Login / Logout / Verificação de sessão existente
 *
 * Uso nos componentes:
 *   const { usuario, logado, login, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setTokenSessaoAPI } from '../servicos/api';

// ===========================================
// CHAVES DE ARMAZENAMENTO LOCAL (SEC05)
// ===========================================

/** Chaves usadas no SecureStore para persistir a sessão de forma criptografada */
const STORAGE_KEYS = {
  /** Token de sessão retornado pelo backend após login */
  TOKEN_SESSAO: 'zentrix_token_sessao',
  /** ID interno do usuário (Telegram ID) */
  USER_ID: 'zentrix_user_id',
  /** Nome do usuário */
  NOME_USUARIO: 'zentrix_nome_usuario',
};

// ===========================================
// CRIAÇÃO DO CONTEXTO
// ===========================================

const AuthContexto = createContext(null);

// ===========================================
// FUNÇÕES AUXILIARES (SecureStore)
// ===========================================

async function salvarSeguro(key, value) {
  if (value === null || value === undefined) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, String(value));
  }
}

async function lerSeguro(key) {
  return await SecureStore.getItemAsync(key);
}

async function deletarSeguro(key) {
  await SecureStore.deleteItemAsync(key);
}

// ===========================================
// PROVIDER
// ===========================================

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    verificarSessaoExistente();
  }, []);

  /**
   * Verifica se existe uma sessão salva no SecureStore.
   * Se existir, restaura o estado do usuário sem precisar logar novamente.
   */
  const verificarSessaoExistente = async () => {
    try {
      const [tokenSessao, userId, nomeUsuario] = await Promise.all([
        lerSeguro(STORAGE_KEYS.TOKEN_SESSAO),
        lerSeguro(STORAGE_KEYS.USER_ID),
        lerSeguro(STORAGE_KEYS.NOME_USUARIO),
      ]);

      if (tokenSessao && userId) {
        setUsuario({
          token_sessao: tokenSessao,
          user_id: userId,
          nome: nomeUsuario || 'Usuário',
        });
        setTokenSessaoAPI(tokenSessao);
      }
    } catch (erro) {
      console.error('[Auth] Erro ao verificar sessão existente:', erro.message);
    } finally {
      setVerificandoSessao(false);
    }
  };

  /**
   * Realiza o login salvando os dados retornados pelo backend.
   * SEC05: usa SecureStore (criptografado) em vez de AsyncStorage.
   *
   * @param {object} dadosLogin - { token_sessao, user_id_interno, nome }
   */
  const login = useCallback(async (dadosLogin) => {
    try {
      const { token_sessao, user_id_interno, nome } = dadosLogin;

      // Persiste no Keychain/Keystore de forma criptografada
      await Promise.all([
        salvarSeguro(STORAGE_KEYS.TOKEN_SESSAO, token_sessao),
        salvarSeguro(STORAGE_KEYS.USER_ID, user_id_interno),
        salvarSeguro(STORAGE_KEYS.NOME_USUARIO, nome || 'Usuário'),
      ]);

      setUsuario({
        token_sessao,
        user_id: user_id_interno,
        nome: nome || 'Usuário',
      });
      setTokenSessaoAPI(token_sessao);

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
        deletarSeguro(STORAGE_KEYS.TOKEN_SESSAO),
        deletarSeguro(STORAGE_KEYS.USER_ID),
        deletarSeguro(STORAGE_KEYS.NOME_USUARIO),
      ]);
      setUsuario(null);
      setTokenSessaoAPI(null);
    } catch (erro) {
      console.error('[Auth] Erro ao fazer logout:', erro.message);
    }
  }, []);

  const valor = {
    usuario,
    logado: !!usuario,
    verificandoSessao,
    login,
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
 * @returns {{ usuario, logado, verificandoSessao, login, logout }}
 */
export const useAuth = () => {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return contexto;
};
