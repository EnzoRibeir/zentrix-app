/**
 * ============================================================
 * TELA_DETALHES_TRANSACAO.JS — Detalhes de uma Transação
 * ============================================================
 * 
 * Exibe os detalhes completos de uma transação selecionada:
 * - Card principal com ícone, nome, categoria, valor e data
 * - Seção "Informações" com tipo, origem, categoria, descrição, ID, parcelas
 * - Seção "Análise Inteligente" com insight baseado nos dados
 * - Botões de ação: editar, excluir, compartilhar
 * 
 * Recebe a transação via navigation params.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES, CORES_SEMANTICAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { obterCategoria, CORES_TIPO_PAGAMENTO } from '../constantes/categorias';
import { formatarMoeda, formatarDataHora } from '../utilitarios/formatadores';
import { useTransacoes } from '../contextos/TransacoesContexto';
import ModalEditarTransacao from '../componentes/ModalEditarTransacao';

/**
 * Tela de detalhes de uma transação individual.
 * 
 * @param {object} route - Contém route.params.transacao
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaDetalhesTransacao = ({ route, navigation }) => {
  const { transacao: transacaoRoute } = route.params;
  const [transacao, setTransacao] = useState(transacaoRoute);
  const [modalEditVisivel, setModalEditVisivel] = useState(false);
  const { remover } = useTransacoes();

  const categoria = obterCategoria(transacao.category);
  const tipoPagamento = CORES_TIPO_PAGAMENTO[transacao.type] || CORES_TIPO_PAGAMENTO['Débito'];
  const ehReceita = transacao.type === 'Emprestado';
  const valor = parseFloat(transacao.amount || 0);

  /**
   * Confirma e executa a exclusão da transação.
   * Mostra Alert de confirmação antes de excluir.
   */
  const aoExcluir = () => {
    Alert.alert(
      'Excluir Transação',
      `Deseja realmente excluir "${transacao.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await remover(transacao.id);
            if (sucesso) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  /**
   * Renderiza uma linha de informação com ícone, label e valor.
   */
  const LinhaInfo = ({ icone, label, valor: infoValor }) => (
    <View style={estilos.linhaInfo}>
      <View style={estilos.linhaInfoIcone}>
        <Feather name={icone} size={18} color={CORES.principal} />
      </View>
      <View style={estilos.linhaInfoTexto}>
        <Text style={estilos.linhaInfoLabel}>{label}</Text>
        <Text style={estilos.linhaInfoValor}>{infoValor}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* HEADER: Botão voltar + Título */}
      {/* ============================================ */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Feather name="arrow-left" size={24} color={CORES.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Detalhes da Transação</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ============================================ */}
      {/* CARD PRINCIPAL: Ícone + Nome + Valor + Data */}
      {/* ============================================ */}
      <View style={estilos.cardPrincipal}>
        {/* Ícone da categoria */}
        <View style={[estilos.categoriaIcone, { backgroundColor: categoria.corFundo }]}>
          <Feather name={categoria.icone} size={28} color={categoria.cor} />
        </View>

        {/* Nome e categoria */}
        <Text style={estilos.descricao}>{transacao.description}</Text>
        <View style={[estilos.categoriaBadge, { backgroundColor: tipoPagamento.corFundo }]}>
          <Text style={[estilos.categoriaBadgeTexto, { color: tipoPagamento.cor }]}>
            {transacao.category}
          </Text>
        </View>

        {/* Valor em destaque */}
        <Text
          style={[
            estilos.valorGrande,
            { color: ehReceita ? CORES_SEMANTICAS.sucesso : CORES_SEMANTICAS.erro },
          ]}
        >
          {ehReceita ? '+' : '-'}{formatarMoeda(valor)}
        </Text>

        {/* Data e hora */}
        <Text style={estilos.dataHora}>
          {formatarDataHora(transacao.created_at)}
        </Text>
      </View>

      {/* ============================================ */}
      {/* SEÇÃO: Informações Detalhadas */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Informações</Text>
      <View style={estilos.cardInfo}>
        <LinhaInfo
          icone="credit-card"
          label="Tipo de Pagamento"
          valor={transacao.type}
        />
        <View style={estilos.separador} />
        <LinhaInfo
          icone="send"
          label="Origem"
          valor={transacao.source === 'IA_CHAT' ? 'Chat IA' : transacao.source === 'TELEGRAM_BOT' ? 'Telegram' : transacao.source || 'App'}
        />
        <View style={estilos.separador} />
        <LinhaInfo
          icone="grid"
          label="Categoria"
          valor={transacao.category}
        />
        <View style={estilos.separador} />
        <LinhaInfo
          icone="file-text"
          label="Descrição"
          valor={transacao.raw_input_phrase || transacao.description}
        />
        <View style={estilos.separador} />
        <LinhaInfo
          icone="hash"
          label="ID da transação"
          valor={`TRX-${transacao.id}`}
        />
        <View style={estilos.separador} />
        <LinhaInfo
          icone="layers"
          label="Parcelamento"
          valor={`${transacao.installments_paid || 1}x de ${transacao.installments_total || 1}`}
        />
        {transacao.debtor_name && (
          <>
            <View style={estilos.separador} />
            <LinhaInfo
              icone="user"
              label="Devedor"
              valor={transacao.debtor_name}
            />
          </>
        )}
      </View>

      {/* ============================================ */}
      {/* SEÇÃO: Análise Inteligente */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Análise Inteligente</Text>
      <TouchableOpacity style={estilos.cardAnalise}>
        <View style={estilos.analiseIcone}>
          <Feather name="zap" size={20} color={CORES.principal} />
        </View>
        <Text style={estilos.analiseTexto}>
          {ehReceita
            ? `Você emprestou ${formatarMoeda(valor)} para ${transacao.debtor_name || 'alguém'}. Faltam ${(transacao.installments_total || 1) - (transacao.installments_paid || 1)} parcelas.`
            : `Essa compra representa uma transação de ${formatarMoeda(valor)} na categoria ${transacao.category}.`
          }
        </Text>
        <Feather name="chevron-right" size={20} color={CORES.textoSecundario} />
      </TouchableOpacity>

      {/* ============================================ */}
      {/* BOTÕES DE AÇÃO */}
      {/* ============================================ */}
      <TouchableOpacity 
        style={estilos.botaoEditar}
        onPress={() => setModalEditVisivel(true)}
      >
        <Feather name="edit-2" size={18} color={CORES.principal} />
        <Text style={estilos.botaoEditarTexto}>Editar transação</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoExcluir} onPress={aoExcluir}>
        <Feather name="trash-2" size={18} color={CORES_SEMANTICAS.erro} />
        <Text style={estilos.botaoExcluirTexto}>Excluir transação</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoCompartilhar}>
        <Feather name="share" size={18} color={CORES.secundaria} />
        <Text style={estilos.botaoCompartilharTexto}>Compartilhar comprovante</Text>
      </TouchableOpacity>

      <ModalEditarTransacao
        visivel={modalEditVisivel}
        aoFechar={(novosCampos) => {
          setModalEditVisivel(false);
          if (novosCampos) {
            setTransacao({ ...transacao, ...novosCampos });
          }
        }}
        transacao={transacao}
      />
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 40,
  },
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
  },
  /* Card Principal */
  cardPrincipal: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    alignItems: 'center',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    borderWidth: 1,
    borderColor: CORES_SEMANTICAS.erro + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoriaIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  descricao: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
    marginBottom: 8,
  },
  categoriaBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: ESPACAMENTOS.raioBordaCompleto,
    marginBottom: 16,
  },
  categoriaBadgeTexto: {
    ...TIPOGRAFIA.legenda,
  },
  valorGrande: {
    ...TIPOGRAFIA.valorDestaque,
    marginBottom: 8,
  },
  dataHora: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
  },
  /* Seções */
  secaoTitulo: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.textoPrincipal,
    marginBottom: 12,
    marginTop: 8,
  },
  /* Card de informações */
  cardInfo: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  linhaInfoIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${CORES.principal}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  linhaInfoTexto: {
    flex: 1,
  },
  linhaInfoLabel: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoPrincipal,
  },
  linhaInfoValor: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: CORES.borda,
    marginLeft: 50,
  },
  /* Análise Inteligente */
  cardAnalise: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analiseIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${CORES.destaque}30`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analiseTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    flex: 1,
    lineHeight: 18,
  },
  /* Botões de ação */
  botaoEditar: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CORES.principal,
  },
  botaoEditarTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.principal,
    marginLeft: 10,
  },
  botaoExcluir: {
    backgroundColor: CORES_SEMANTICAS.erro + '10',
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  botaoExcluirTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES_SEMANTICAS.erro,
    marginLeft: 10,
  },
  botaoCompartilhar: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  botaoCompartilharTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.secundaria,
    marginLeft: 10,
  },
});

export default TelaDetalhesTransacao;
