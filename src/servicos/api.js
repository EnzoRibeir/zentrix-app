/**
 * ============================================================
 * API.JS — Serviço de Comunicação com o Backend AWS Lambda
 * ============================================================
 * 
 * Centraliza todas as chamadas HTTP para a API do Zentrix.
 * O backend roda no AWS Lambda e suporta 3 métodos:
 * 
 * - GET    → Listar transações do usuário
 * - POST   → Criar transação (via frase processada por IA)
 * - DELETE → Excluir transação por ID
 * 
 * Endpoint base:
 * https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia
 * 
 * Referência do backend: v4.py (AWS Lambda handler)
 */

// ===========================================
// CONFIGURAÇÕES
// ===========================================

/** URL base da API no AWS API Gateway (região sa-east-1 — São Paulo) */
const URL_BASE = 'https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia';

/** 
 * ID do usuário atual. 
 * TODO: Futuramente virá de um sistema de autenticação (STRIDE)
 */
const ID_USUARIO = 'enzo_01';

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
// ENDPOINTS DA API
// ===========================================

/**
 * Busca todas as transações do usuário.
 * Usa o método GET com user_id como query parameter.
 * 
 * Endpoint no backend: tratar_get() em v4.py (linha 237)
 * SQL executado: SELECT * FROM transacoes WHERE user_id = %s ORDER BY created_at DESC
 * 
 * @returns {Promise<Array>} Lista de transações ordenadas por data (mais recente primeiro)
 * @throws {Error} Se a requisição falhar
 * 
 * Exemplo de retorno:
 * [
 *   {
 *     id: 4,
 *     user_id: "enzo_01",
 *     description: "brinquedo",
 *     amount: "300.00",
 *     category: "Compras e Mimos",
 *     type: "Débito",
 *     source: "IA_CHAT",
 *     created_at: "2026-05-22 00:05:00",
 *     installments_total: 1,
 *     installments_paid: 1,
 *     debtor_name: null,
 *     raw_input_phrase: "comprei um brinquedo que custa 300 reais no pix"
 *   }
 * ]
 */
export const buscarTransacoes = async () => {
  try {
    const url = `${URL_BASE}?user_id=${ID_USUARIO}`;
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
    if (typeof dados === 'string') {
      return JSON.parse(dados);
    }

    return dados;
  } catch (erro) {
    console.error('[API] Erro em buscarTransacoes:', erro.message);
    throw erro;
  }
};

/**
 * Cria uma nova transação enviando uma frase em linguagem natural.
 * A IA (Gemini) no backend processa a frase e extrai os dados.
 * 
 * Endpoint no backend: tratar_post() → CASO 3 (linha 202)
 * Usa o campo 'frase' no body para ativar o processamento por IA.
 * 
 * @param {string} frase - Frase descrevendo a transação
 *   Exemplos: "comprei um lanche de 25 reais no débito"
 *             "emprestei 500 pra João parcelado em 6 vezes"
 * @returns {Promise<object>} Dados da transação criada pela IA
 * @throws {Error} Se a requisição falhar ou a IA não conseguir processar
 */
export const criarTransacaoPorFrase = async (frase) => {
  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: ID_USUARIO,
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
 * Endpoint no backend: tratar_delete() em v4.py (linha 260)
 * SQL executado: DELETE FROM transacoes WHERE id = %s AND user_id = %s
 * 
 * @param {number} idTransacao - ID da transação a ser excluída
 * @returns {Promise<object>} Confirmação de exclusão
 * @throws {Error} Se a requisição falhar
 */
export const excluirTransacao = async (idTransacao) => {
  try {
    const resposta = await fetchComTimeout(URL_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: ID_USUARIO,
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
