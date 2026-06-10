/**
 * ============================================================
 * TELA_RELATORIOS.JS — Tela de Relatórios Financeiros
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { useNotificacoes } from '../contextos/NotificacoesContexto';
import { useAuth } from '../contextos/AuthContexto';
import { formatarMoeda } from '../utilitarios/formatadores';
import {
  calcularTotalGasto,
  calcularTotalRecebido,
  calcularSaldo,
  calcularMediaDiaria,
  calcularGastosPorCategoria,
  calcularEvolucaoGastos,
} from '../utilitarios/calculadores';
import FiltroAbas from '../componentes/FiltroAbas';
import CartaoResumo from '../componentes/CartaoResumo';
import GraficoCategorias from '../componentes/GraficoCategorias';
import GraficoEvolucao from '../componentes/GraficoEvolucao';

const ABAS_PERIODO = ['Este mês', 'Últimos 3 meses', 'Este ano', 'Personalizado'];
const URL_BASE = 'https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia';

const TelaRelatorios = ({ navigation }) => {
  const { CORES } = useTema();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilos(CORES, insets);

  const { transacoes, carregar } = useTransacoes();
  const { naoLidosCount } = useNotificacoes();
  const { usuario } = useAuth();
  const [periodoAtivo, setPeriodoAtivo] = useState('Este mês');

  // Estado do modal de importação CSV
  const [modalCsvVisivel, setModalCsvVisivel] = useState(false);
  const [csvStatus, setCsvStatus] = useState('idle'); // idle | selecionando | enviando | sucesso | erro
  const [csvArquivoNome, setCsvArquivoNome] = useState('');
  const [csvMensagem, setCsvMensagem] = useState('');

  // Cálculos derivados
  const totalGasto = useMemo(() => calcularTotalGasto(transacoes), [transacoes]);
  const totalRecebido = useMemo(() => calcularTotalRecebido(transacoes), [transacoes]);
  const saldo = useMemo(() => calcularSaldo(transacoes), [transacoes]);
  const mediaDiaria = useMemo(() => calcularMediaDiaria(transacoes), [transacoes]);
  const gastosPorCategoria = useMemo(() => calcularGastosPorCategoria(transacoes), [transacoes]);
  const evolucao = useMemo(() => calcularEvolucaoGastos(transacoes), [transacoes]);

  // ============================================================
  // LÓGICA DE IMPORTAÇÃO CSV
  // ============================================================
  const handleImportarCSV = async () => {
    setModalCsvVisivel(true);
    setCsvStatus('idle');
    setCsvArquivoNome('');
    setCsvMensagem('');
  };

  const handleSelecionarArquivo = async () => {
    try {
      setCsvStatus('selecionando');
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        setCsvStatus('idle');
        return;
      }

      const arquivo = resultado.assets[0];
      setCsvArquivoNome(arquivo.name);
      setCsvStatus('enviando');

      // Lê o conteúdo do arquivo
      const respArquivo = await fetch(arquivo.uri);
      const csvText = await respArquivo.text();

      if (!csvText || csvText.trim().length === 0) {
        setCsvStatus('erro');
        setCsvMensagem('O arquivo está vazio ou não pôde ser lido.');
        return;
      }

      // Envia para o backend
      const userId = usuario?.user_id;
      if (!userId) {
        setCsvStatus('erro');
        setCsvMensagem('Usuário não identificado. Faça login novamente.');
        return;
      }

      const resposta = await fetch(URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_text: csvText, user_id: userId }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setCsvStatus('sucesso');
        const qtd = dados.count || dados.importadas || '?';
        setCsvMensagem(`${qtd} transação(ões) importada(s) com sucesso!`);
        await carregar(); // Recarrega as transações
      } else {
        setCsvStatus('erro');
        setCsvMensagem(dados.erro || dados.error || 'Erro ao processar o CSV no servidor.');
      }
    } catch (err) {
      setCsvStatus('erro');
      setCsvMensagem('Erro ao ler ou enviar o arquivo. Tente novamente.');
      console.error('CSV import error:', err);
    }
  };

  const handleFecharModal = () => {
    setModalCsvVisivel(false);
    setCsvStatus('idle');
    setCsvArquivoNome('');
    setCsvMensagem('');
  };

  // ============================================================
  // RENDER DO MODAL CSV
  // ============================================================
  const renderModalCSV = () => (
    <Modal
      visible={modalCsvVisivel}
      transparent
      animationType="slide"
      onRequestClose={handleFecharModal}
    >
      <View style={estilos.modalOverlay}>
        <View style={estilos.modalCard}>
          <View style={estilos.modalHandle} />

          {/* Header do modal */}
          <View style={estilos.modalHeader}>
            <View style={estilos.modalIconeContainer}>
              <Feather name="upload" size={22} color={CORES.principal} />
            </View>
            <View style={estilos.modalHeaderTexto}>
              <Text style={estilos.modalTitulo}>Importar CSV</Text>
              <Text style={estilos.modalSubtitulo}>Extrato C6 Bank</Text>
            </View>
            <TouchableOpacity onPress={handleFecharModal} style={estilos.modalBotaoFechar}>
              <Feather name="x" size={18} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          {/* Instrução */}
          <View style={estilos.instrucaoBox}>
            <Feather name="info" size={14} color={CORES.principal} style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={estilos.instrucaoTexto}>
              Exporte o extrato do seu C6 Bank em formato CSV (separado por ponto e vírgula) e selecione o arquivo abaixo. As transações serão categorizadas automaticamente por IA.
            </Text>
          </View>

          {/* Área de arquivo */}
          {csvStatus === 'idle' || csvStatus === 'selecionando' ? (
            <TouchableOpacity
              style={estilos.areaUpload}
              onPress={handleSelecionarArquivo}
              disabled={csvStatus === 'selecionando'}
              activeOpacity={0.7}
            >
              <Feather name="file-text" size={32} color={CORES.principal} style={{ marginBottom: 10 }} />
              <Text style={estilos.uploadTexto}>
                {csvStatus === 'selecionando' ? 'Abrindo seletor...' : 'Toque para selecionar o arquivo CSV'}
              </Text>
              <Text style={estilos.uploadSubTexto}>Formato: .csv (C6 Bank)</Text>
            </TouchableOpacity>
          ) : csvStatus === 'enviando' ? (
            <View style={estilos.statusContainer}>
              <ActivityIndicator size="large" color={CORES.principal} />
              <Text style={estilos.statusTexto}>Processando "{csvArquivoNome}"...</Text>
              <Text style={estilos.statusSubTexto}>A IA está categorizando suas transações</Text>
            </View>
          ) : csvStatus === 'sucesso' ? (
            <View style={estilos.statusContainer}>
              <View style={[estilos.statusIcone, { backgroundColor: `${CORES_SEMANTICAS.sucesso}18` }]}>
                <Feather name="check-circle" size={36} color={CORES_SEMANTICAS.sucesso} />
              </View>
              <Text style={[estilos.statusTexto, { color: CORES_SEMANTICAS.sucesso }]}>Importação concluída!</Text>
              <Text style={estilos.statusSubTexto}>{csvMensagem}</Text>
            </View>
          ) : (
            <View style={estilos.statusContainer}>
              <View style={[estilos.statusIcone, { backgroundColor: `${CORES_SEMANTICAS.erro}18` }]}>
                <Feather name="alert-circle" size={36} color={CORES_SEMANTICAS.erro} />
              </View>
              <Text style={[estilos.statusTexto, { color: CORES_SEMANTICAS.erro }]}>Falha na importação</Text>
              <Text style={estilos.statusSubTexto}>{csvMensagem}</Text>
            </View>
          )}

          {/* Botões de ação */}
          <View style={estilos.modalBotoes}>
            {csvStatus === 'erro' && (
              <TouchableOpacity
                style={estilos.botaoTentarNovamente}
                onPress={() => { setCsvStatus('idle'); setCsvMensagem(''); setCsvArquivoNome(''); }}
              >
                <Feather name="refresh-cw" size={15} color={CORES.principal} style={{ marginRight: 6 }} />
                <Text style={[estilos.botaoTexto, { color: CORES.principal }]}>Tentar novamente</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[estilos.botaoFecharModal, csvStatus === 'sucesso' && { backgroundColor: CORES.principal }]}
              onPress={handleFecharModal}
            >
              <Text style={[estilos.botaoTexto, { color: csvStatus === 'sucesso' ? CORES.branco : CORES.textoSecundario }]}>
                {csvStatus === 'sucesso' ? 'Concluir' : 'Cancelar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {renderModalCSV()}
      <ScrollView
        style={estilos.container}
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={estilos.header}>
          <View>
            <Text style={estilos.titulo}>Relatórios</Text>
            <Text style={estilos.subtitulo}>Acompanhe sua saúde financeira</Text>
          </View>
          <View style={estilos.headerIcones}>
            <TouchableOpacity style={estilos.iconeBotao} onPress={handleImportarCSV}>
              <Feather name="upload" size={22} color={CORES.principal} />
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.iconeBotao}
              onPress={() => navigation.navigate('Notificacoes')}
            >
              <Feather name="bell" size={22} color={CORES.principal} />
              {naoLidosCount > 0 && (
                <View style={estilos.badge}>
                  <Text style={estilos.badgeTexto}>
                    {naoLidosCount > 9 ? '9+' : naoLidosCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ABAS DE PERÍODO */}
        <FiltroAbas
          abas={ABAS_PERIODO}
          abaSelecionada={periodoAtivo}
          aoSelecionarAba={setPeriodoAtivo}
        />

        {/* RESUMO DO PERÍODO */}
        <Text style={estilos.secaoTitulo}>Resumo do período</Text>
        <View style={estilos.gridResumo}>
          <CartaoResumo
            icone="arrow-down-left"
            label="Total Gasto"
            valor={formatarMoeda(totalGasto)}
            corValor={CORES.textoPrincipal}
            corIcone={CORES.principal}
          />
          <View style={{ width: 10 }} />
          <CartaoResumo
            icone="arrow-up-right"
            label="Total Recebido"
            valor={formatarMoeda(totalRecebido)}
            corValor={CORES_SEMANTICAS.sucesso}
            corIcone={CORES_SEMANTICAS.sucesso}
          />
        </View>
        <View style={[estilos.gridResumo, { marginTop: 10 }]}>
          <CartaoResumo
            icone="trending-up"
            label="Saldo do Período"
            valor={formatarMoeda(saldo)}
            corValor={saldo >= 0 ? CORES_SEMANTICAS.sucesso : CORES_SEMANTICAS.erro}
            corIcone={CORES_SEMANTICAS.sucesso}
          />
          <View style={{ width: 10 }} />
          <CartaoResumo
            icone="bar-chart-2"
            label="Média Diária de Gastos"
            valor={formatarMoeda(mediaDiaria)}
            corValor={CORES.secundaria}
            corIcone={CORES.secundaria}
          />
        </View>

        {/* GRÁFICO: Evolução de Gastos */}
        <View style={estilos.secaoGrafico}>
          <GraficoEvolucao
            labels={evolucao.labels}
            valores={evolucao.valores}
            titulo="Evolução de Gastos"
          />
        </View>

        {/* GRÁFICO: Gastos por Categoria */}
        {gastosPorCategoria.length > 0 && (
          <View style={estilos.secaoGrafico}>
            <Text style={estilos.secaoTitulo}>Gastos por Categoria</Text>
            <GraficoCategorias
              dados={gastosPorCategoria}
              total={totalGasto}
            />
          </View>
        )}

        {/* COMPARATIVO DE GASTOS */}
        <Text style={estilos.secaoTitulo}>Comparativo de Gastos</Text>
        <View style={estilos.gridComparativo}>
          <View style={estilos.cardComparativo}>
            <View style={estilos.comparativoHeader}>
              <Feather name="trending-up" size={16} color={CORES_SEMANTICAS.erro} />
              <Text style={estilos.comparativoLabel}>vs. Mês Anterior</Text>
            </View>
            <Text style={[estilos.comparativoPorcentagem, { color: CORES_SEMANTICAS.erro }]}>+12,5%</Text>
            <Text style={estilos.comparativoValor}>{formatarMoeda(totalGasto * 0.89)}</Text>
            <Text style={estilos.comparativoDescricao}>Você gastou mais que no mês anterior</Text>
          </View>
          <View style={{ width: 10 }} />
          <View style={estilos.cardComparativo}>
            <View style={estilos.comparativoHeader}>
              <Feather name="trending-down" size={16} color={CORES_SEMANTICAS.sucesso} />
              <Text style={estilos.comparativoLabel}>vs. Mesmo período (Ano anterior)</Text>
            </View>
            <Text style={[estilos.comparativoPorcentagem, { color: CORES_SEMANTICAS.sucesso }]}>-8,3%</Text>
            <Text style={estilos.comparativoValor}>{formatarMoeda(totalGasto * 1.09)}</Text>
            <Text style={estilos.comparativoDescricao}>Você gastou menos que no ano anterior</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const criarEstilos = (CORES, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    paddingTop: (insets?.top || 0) + 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titulo: { ...TIPOGRAFIA.tituloMedio, color: CORES.textoPrincipal },
  subtitulo: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginTop: 2 },
  headerIcones: { flexDirection: 'row', gap: 10 },
  iconeBotao: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: CORES.branco,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeTexto: { color: '#fff', fontSize: 9, fontWeight: '700' },
  secaoTitulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal, marginBottom: 12, marginTop: 16 },
  secaoGrafico: { marginTop: 16 },
  gridResumo: { flexDirection: 'row' },
  gridComparativo: { flexDirection: 'row' },
  cardComparativo: {
    flex: 1, backgroundColor: CORES.branco, borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard - 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  comparativoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  comparativoLabel: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginLeft: 6, flex: 1 },
  comparativoPorcentagem: { ...TIPOGRAFIA.tituloMedio, marginBottom: 4 },
  comparativoValor: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginBottom: 8 },
  comparativoDescricao: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, lineHeight: 16 },

  // ============ MODAL CSV ============
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CORES.fundo,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: CORES.borda,
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
  },
  modalIconeContainer: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: `${CORES.principal}15`,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderTexto: { flex: 1 },
  modalTitulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal, fontSize: 18 },
  modalSubtitulo: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario },
  modalBotaoFechar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: CORES.branco, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  instrucaoBox: {
    flexDirection: 'row',
    backgroundColor: `${CORES.principal}10`,
    borderRadius: 12, padding: 12,
    marginBottom: 16,
  },
  instrucaoTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoPrincipal,
    flex: 1, lineHeight: 18,
  },
  areaUpload: {
    borderWidth: 2, borderColor: CORES.borda, borderStyle: 'dashed',
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: CORES.branco,
    marginBottom: 20,
  },
  uploadTexto: {
    ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal, textAlign: 'center', marginBottom: 4,
  },
  uploadSubTexto: {
    ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center', paddingVertical: 28, marginBottom: 16,
  },
  statusIcone: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  statusTexto: {
    ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal,
    textAlign: 'center', marginBottom: 6,
  },
  statusSubTexto: {
    ...TIPOGRAFIA.legenda, color: CORES.textoSecundario,
    textAlign: 'center', lineHeight: 18,
  },
  modalBotoes: {
    flexDirection: 'row', gap: 10,
  },
  botaoTentarNovamente: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: ESPACAMENTOS.raioBorda,
    borderWidth: 1.5, borderColor: CORES.principal,
    backgroundColor: CORES.branco,
  },
  botaoFecharModal: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: ESPACAMENTOS.raioBorda,
    backgroundColor: CORES.branco,
    borderWidth: 1.5, borderColor: CORES.borda,
  },
  botaoTexto: { ...TIPOGRAFIA.corpo },
});

export default TelaRelatorios;
