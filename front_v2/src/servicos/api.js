/**
 * ============================================================
 * API.JS — Serviço de Comunicação com o Backend AWS Lambda
 * ============================================================
 * 
 * Centraliza todas as chamadas HTTP para a API do Zentrix.
 * O backend roda no AWS Lambda e suporta 4 métodos:
 * 
 * - GET    → Listar transações do usuário
 * - POST   → Criar transação (via frase processada por IA) / Autenticação Telegram
 * - DELETE → Excluir transação por ID
 * - PUT    → Atualizar transação ou perfil do usuário
 * 
 * Endpoint base:
 * https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia
 * 
 * IMPORTANTE: O user_id agora é dinâmico, vindo do contexto de autenticação.
 * Cada usuário do Telegram possui seu próprio ID único.
 */

// ===========================================
// CONFIGURAÇÕES
// ===========================================

/** URL base da API no AWS API Gateway (região sa-east-1 — São Paulo) */
const URL_BASE = 'https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia';

/** Tempo limite para requisições (em milissegundos) */
const TIMEOUT_MS = 15000;

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

/**
 * Wrapper para fetch com timeout.
 * Evita que requisições fiquem pendentes indefinidamente.
 * 
 * @param {string} url - URL da requisição
 * @param {object} opcoes - Opções do fetch (method, headers, body)
 * @returns {Promise<Response>} Resposta da API
 * @throws {Error} Se a requisição exceder o timeout ou falhar
 */
const fetchComTimeout = async (url, opcoes = {}) => {
  const controlador = new AbortController();
  const idTimeout = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(url, {
      ...opcoes,
      signal: controlador.signal,
    });
    clearTimeout(idTimeout);
    return resposta;
  } catch (erro) {
    clearTimeout(idTimeout);
    if (erro.name === 'AbortError') {
      throw new Error('Tempo limite da requisição excedido. Verifique sua conexão.');
    }
    throw erro;
  }
};

// ===========================================
// AUTENTICAÇÃO VIA TELEGRAM
// ===========================================

/**
 * Envia os dados de autenticação do Telegram para o backend validar.
 * O backend (v5.py, CASO 2) verifica o hash HMAC-SHA256 usando o
 * TELEGRAM_TOKEN para garantir que os dados são legítimos.
 * 
 * @param {object} dadosTelegram - Dados retornados pelo widget de login do Telegram
 *   { id, first_name, last_name, username, photo_url, auth_date, hash }
 * @returns {Promise<object>} Dados da sessão:
 *   { login: true, token_sessao: "uuid", user_id_interno: "telegram_id", nome: "..." }
 * @throws {Error} Se a validação falhar (hash inválido, expirado, etc)
 */
export const autenticarComTelegram = async (dadosTelegram) => {
  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosTelegram),
    });

    const dados = await resposta.json();
    let jsonDados = typeof dados === 'string' ? JSON.parse(dados) : dados;

    if (!resposta.ok) {
      throw new Error(jsonDados.erro || `Erro de autenticação: ${resposta.status}`);
    }

    return jsonDados;
  } catch (erro) {
    console.error('[API] Erro em autenticarComTelegram:', erro.message);
    throw erro;
  }
};

// ===========================================
// ENDPOINTS DA API (com user_id dinâmico)
// ===========================================

/**
 * Busca todas as transações do usuário.
 * Usa o método GET com user_id como query parameter.
 * 
 * Endpoint no backend: tratar_get() em v5.py
 * SQL executado: SELECT * FROM transacoes WHERE user_id = %s ORDER BY created_at DESC
 * 
 * @param {string} userId - ID do usuário (Telegram ID)
 * @returns {Promise<object>} { transacoes: Array, usuario: object }
 * @throws {Error} Se a requisição falhar
 */
export const buscarTransacoes = async (userId) => {
  if (!userId) {
    throw new Error('user_id é obrigatório para buscar transações.');
  }

  try {
    const url = `${URL_BASE}?user_id=${userId}`;
    const resposta = await fetchComTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao buscar transações: ${resposta.status}`);
    }

    const dados = await resposta.json();

    // A API pode retornar o body como string JSON (duplo encode do Lambda)
    let jsonDados = dados;
    if (typeof dados === 'string') {
      jsonDados = JSON.parse(dados);
    }

    // Compatibilidade v4 (array direto) vs v5 ({ transacoes: [], usuario: {} })
    if (Array.isArray(jsonDados)) {
      return { transacoes: jsonDados, usuario: null };
    }
    return { 
      transacoes: jsonDados.transacoes || [],
      usuario: jsonDados.usuario || null
    };
  } catch (erro) {
    console.error('[API] Erro em buscarTransacoes:', erro.message);
    throw erro;
  }
};

/**
 * Cria uma nova transação enviando uma frase em linguagem natural.
 * A IA (Gemini) no backend processa a frase e extrai os dados.
 * 
 * @param {string} userId - ID do usuário (Telegram ID)
 * @param {string} frase - Frase descrevendo a transação
 *   Exemplos: "comprei um lanche de 25 reais no débito"
 *             "emprestei 500 pra João parcelado em 6 vezes"
 * @returns {Promise<object>} Dados da transação criada pela IA
 * @throws {Error} Se a requisição falhar ou a IA não conseguir processar
 */
export const criarTransacaoPorFrase = async (userId, frase) => {
  if (!userId) {
    throw new Error('user_id é obrigatório para criar transação.');
  }

  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        frase: frase,
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao criar transação: ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (typeof dados === 'string') {
      return JSON.parse(dados);
    }

    return dados;
  } catch (erro) {
    console.error('[API] Erro em criarTransacaoPorFrase:', erro.message);
    throw erro;
  }
};

/**
 * Exclui uma transação pelo seu ID.
 * 
 * @param {string} userId - ID do usuário (Telegram ID)
 * @param {number} idTransacao - ID da transação a ser excluída
 * @returns {Promise<object>} Confirmação de exclusão
 * @throws {Error} Se a requisição falhar
 */
export const excluirTransacao = async (userId, idTransacao) => {
  if (!userId) {
    throw new Error('user_id é obrigatório para excluir transação.');
  }

  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        id: idTransacao,
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao excluir transação: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return dados;
  } catch (erro) {
    console.error('[API] Erro em excluirTransacao:', erro.message);
    throw erro;
  }
};

/**
 * Atualiza dados de uma transação.
 * 
 * @param {string} userId - ID do usuário (Telegram ID)
 * @param {number} id - ID da transação
 * @param {object} camposAtualizados - Objeto com os campos a serem atualizados
 */
export const atualizarTransacao = async (userId, id, camposAtualizados) => {
  if (!userId) {
    throw new Error('user_id é obrigatório para atualizar transação.');
  }

  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        action: 'update_transaction',
        id: id,
        ...camposAtualizados
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao atualizar transação: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return typeof dados === 'string' ? JSON.parse(dados) : dados;
  } catch (erro) {
    console.error('[API] Erro em atualizarTransacao:', erro.message);
    throw erro;
  }
};

/**
 * Atualiza o perfil do usuário.
 * 
 * @param {string} userId - ID do usuário (Telegram ID)
 * @param {object} dadosUsuario - { salario_mensal, limite_mensal, dia_vencimento_fatura }
 */
export const atualizarUsuario = async (userId, dadosUsuario) => {
  if (!userId) {
    throw new Error('user_id é obrigatório para atualizar usuário.');
  }

  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        action: 'update_user',
        ...dadosUsuario
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao atualizar usuário: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return typeof dados === 'string' ? JSON.parse(dados) : dados;
  } catch (erro) {
    console.error('[API] Erro em atualizarUsuario:', erro.message);
    throw erro;
  }
};
