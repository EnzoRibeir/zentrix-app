/**
 * ============================================================
 * ITEM_TRANSACAO.JS — Item de Transação na Lista
 * ============================================================
 * 
 * Componente que renderiza uma transação individual na lista.
 * Usado na Tela Inicial (últimas transações) e TelaTransações (lista completa).
 * 
 * Layout (conforme Figma):
 * [Ícone Categoria]  Nome da Transação       -R$ 150,00
 *                    Categoria • DD/MM/AAAA    HH:MM     >
 *                    [Badge Tipo]
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { obterCategoria, CORES_TIPO_PAGAMENTO } from '../constantes/categorias';
import { formatarMoeda, formatarDataCurta, formatarHora } from '../utilitarios/formatadores';

/**
 * Renderiza uma transação na lista com ícone, descrição, valor e badge.
 * 
 * @param {object} transacao - Objeto de transação vindo da API
 * @param {function} aoClicar - Callback quando o item é clicado (navega p/ detalhes)
 * @param {boolean} mostrarBadge - Se true, exibe badge com tipo de pagamento
 */
const ItemTransacao = ({ transacao, aoClicar, mostrarBadge = true }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const categoria = obterCategoria(transacao.category);
  const tipoPagamento = CORES_TIPO_PAGAMENTO[transacao.type] || CORES_TIPO_PAGAMENTO['Débito'];
  const ehReceita = transacao.type === 'Emprestado';
  
  const parcelas = parseInt(transacao.installments_total || 1, 10);
  const ehParcelado = (transacao.type === 'Crédito Parcelado' || transacao.type === 'Emprestado') && parcelas > 1;
  const valorTotal = parseFloat(transacao.amount || 0);
  const valorMensal = ehParcelado ? valorTotal / parcelas : valorTotal;

  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={() => aoClicar && aoClicar(transacao)}
      activeOpacity={0.7}
    >
      {/* Ícone da categoria (círculo colorido) */}
      <View style={[estilos.containerIcone, { backgroundColor: categoria.corFundo }]}>
        <Feather name={categoria.icone} size={22} color={categoria.cor} />
      </View>

      {/* Informações centrais: nome, categoria, badge */}
      <View style={estilos.containerInfo}>
        <Text style={estilos.descricao} numberOfLines={1}>
          {transacao.description}
        </Text>
        <Text style={estilos.categoriaTexto}>
          {transacao.category} • {formatarDataCurta(transacao.created_at)}
        </Text>
        {mostrarBadge && (
          <View style={[estilos.badge, { backgroundColor: tipoPagamento.corFundo }]}>
            <Text style={[estilos.badgeTexto, { color: tipoPagamento.cor }]}>
              {ehParcelado ? `${tipoPagamento.texto} (${parcelas}x)` : tipoPagamento.texto}
            </Text>
          </View>
        )}
      </View>

      {/* Valor e horário (lado direito) */}
      <View style={estilos.containerValor}>
        <Text
          style={[
            estilos.valor,
            { color: ehReceita ? CORES_SEMANTICAS.sucesso : CORES_SEMANTICAS.erro },
          ]}
        >
          {ehReceita ? '+' : '-'}{formatarMoeda(valorMensal)}
        </Text>
        {ehParcelado && (
          <Text style={estilos.textoParcelas}>Total: {formatarMoeda(valorTotal)}</Text>
        )}
        <Text style={estilos.horario}>{formatarHora(transacao.created_at)}</Text>
      </View>

      {/* Seta indicando que é clicável */}
      <Feather name="chevron-right" size={18} color={CORES.textoSecundario} />
    </TouchableOpacity>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard - 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    /* Sombra sutil */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  containerIcone: {
    width: ESPACAMENTOS.tamanhoIconeCategoria,
    height: ESPACAMENTOS.tamanhoIconeCategoria,
    borderRadius: ESPACAMENTOS.tamanhoIconeCategoria / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  containerInfo: {
    flex: 1,
    marginRight: 8,
  },
  descricao: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    marginBottom: 2,
  },
  categoriaTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: ESPACAMENTOS.raioBordaPequeno,
  },
  badgeTexto: {
    ...TIPOGRAFIA.badge,
  },
  containerValor: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  valor: {
    ...TIPOGRAFIA.corpoPequeno,
    fontWeight: '600',
  },
  textoParcelas: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
    fontSize: 10,
  },
  horario: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
});

export default ItemTransacao;
