import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { obterCategoria } from '../constantes/categorias';
import { formatarMoeda } from '../utilitarios/formatadores';

export default function ModalEditarTransacao({ visivel, aoFechar, transacao }) {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { atualizar } = useTransacoes();
  const [descricao, setDescricao] = useState(transacao?.description || '');
  const [valor, setValor] = useState(transacao?.amount ? String(transacao.amount) : '');
  const [carregando, setCarregando] = useState(false);
  const [erroDescricao, setErroDescricao] = useState('');
  const [erroValor, setErroValor] = useState('');

  React.useEffect(() => {
    if (visivel && transacao) {
      setDescricao(transacao.description || '');
      setValor(transacao.amount ? String(transacao.amount) : '');
      setErroDescricao('');
      setErroValor('');
    }
  }, [visivel, transacao]);

  const handleSalvar = async () => {
    let valido = true;
    if (!descricao.trim()) {
      setErroDescricao('Informe uma descrição.');
      valido = false;
    } else {
      setErroDescricao('');
    }
    if (!valor.trim() || isNaN(parseFloat(valor.replace(',', '.')))) {
      setErroValor('Informe um valor válido.');
      valido = false;
    } else {
      setErroValor('');
    }
    if (!valido) return;

    setCarregando(true);
    const campos = {
      description: descricao,
      amount: parseFloat(valor.replace(',', '.')),
    };

    const sucesso = await atualizar(transacao.id, campos);
    setCarregando(false);

    if (sucesso) {
      aoFechar(campos);
    }
  };

  if (!transacao) return null;

  const catInfo = obterCategoria(transacao.category || 'Outros');
  const isNegativo = parseFloat(transacao.amount || 0) < 0;
  const corValor = isNegativo ? CORES_SEMANTICAS.erro : CORES_SEMANTICAS.sucesso;

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={() => aoFechar()}
    >
      <KeyboardAvoidingView
        style={estilos.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.modalCard}>
          {/* Handle drag */}
          <View style={estilos.handle} />

          {/* Header */}
          <View style={estilos.header}>
            <View style={estilos.headerTexto}>
              <Text style={estilos.titulo}>Editar Transação</Text>
              <Text style={estilos.subtituloHeader}>Altere os campos desejados</Text>
            </View>
            <TouchableOpacity onPress={() => aoFechar()} disabled={carregando} style={estilos.botaoFechar}>
              <Feather name="x" size={20} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          {/* Info card da transação original */}
          <View style={estilos.infoCard}>
            {/* Ícone da categoria */}
            <View style={[estilos.iconeCategoria, { backgroundColor: catInfo.corFundo }]}>
              <Feather name={catInfo.icone} size={22} color={catInfo.cor} />
            </View>
            <View style={estilos.infoTextos}>
              <Text style={estilos.infoDescricao} numberOfLines={1}>{transacao.description}</Text>
              <Text style={estilos.infoCategoria}>{transacao.category || 'Outros'}</Text>
            </View>
            <View style={estilos.infoValorContainer}>
              <Text style={[estilos.infoValor, { color: corValor }]}>
                {formatarMoeda(Math.abs(parseFloat(transacao.amount || 0)))}
              </Text>
              {/* Badge tipo pagamento */}
              {transacao.type && (
                <View style={[estilos.tipoBadge, { backgroundColor: `${catInfo.cor}18` }]}>
                  <Text style={[estilos.tipoBadgeTexto, { color: catInfo.cor }]}>
                    {transacao.type}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={estilos.formulario}>
              {/* Campo Descrição */}
              <View style={estilos.campoWrapper}>
                <Text style={estilos.label}>Descrição</Text>
                <View style={[estilos.inputWrapper, erroDescricao ? estilos.inputErro : null]}>
                  <Feather name="file-text" size={16} color={CORES.textoSecundario} style={estilos.inputIcone} />
                  <TextInput
                    style={estilos.input}
                    value={descricao}
                    onChangeText={(t) => { setDescricao(t); if (t.trim()) setErroDescricao(''); }}
                    placeholder="Ex: Almoço no restaurante"
                    placeholderTextColor={CORES.textoSecundario}
                    editable={!carregando}
                  />
                </View>
                {!!erroDescricao && (
                  <View style={estilos.erroRow}>
                    <Feather name="alert-circle" size={12} color={CORES_SEMANTICAS.erro} />
                    <Text style={estilos.erroTexto}>{erroDescricao}</Text>
                  </View>
                )}
              </View>

              {/* Campo Valor */}
              <View style={estilos.campoWrapper}>
                <Text style={estilos.label}>Valor (R$)</Text>
                <View style={[estilos.inputWrapper, erroValor ? estilos.inputErro : null]}>
                  <Feather name="dollar-sign" size={16} color={CORES.textoSecundario} style={estilos.inputIcone} />
                  <TextInput
                    style={estilos.input}
                    value={valor}
                    onChangeText={(t) => { setValor(t); if (t.trim()) setErroValor(''); }}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={CORES.textoSecundario}
                    editable={!carregando}
                  />
                </View>
                {!!erroValor && (
                  <View style={estilos.erroRow}>
                    <Feather name="alert-circle" size={12} color={CORES_SEMANTICAS.erro} />
                    <Text style={estilos.erroTexto}>{erroValor}</Text>
                  </View>
                )}
              </View>

              {/* Aviso campos bloqueados */}
              <View style={estilos.avisoWrapper}>
                <Feather name="info" size={13} color={CORES.textoSecundario} />
                <Text style={estilos.avisoTexto}>
                  Categoria e tipo de pagamento não podem ser alterados por aqui.
                </Text>
              </View>

              {/* Botões */}
              <View style={estilos.botoesRow}>
                <TouchableOpacity
                  style={estilos.botaoCancelar}
                  onPress={() => aoFechar()}
                  disabled={carregando}
                >
                  <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[estilos.botaoSalvar, carregando && estilos.botaoDesabilitado]}
                  onPress={handleSalvar}
                  disabled={carregando}
                >
                  {carregando ? (
                    <ActivityIndicator color={CORES.branco} size="small" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color={CORES.branco} style={{ marginRight: 6 }} />
                      <Text style={estilos.textoBotaoSalvar}>Salvar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const criarEstilos = (CORES) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CORES.fundo,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: CORES.borda,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    paddingTop: 4,
  },
  headerTexto: { flex: 1 },
  titulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
    fontSize: 20,
  },
  subtituloHeader: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  botaoFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CORES.branco,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 12,
  },
  /* Info card */
  infoCard: {
    backgroundColor: CORES.branco,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard - 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#274C77',
  },
  iconeCategoria: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextos: { flex: 1 },
  infoDescricao: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    fontSize: 15,
  },
  infoCategoria: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  infoValorContainer: { alignItems: 'flex-end' },
  infoValor: {
    ...TIPOGRAFIA.corpo,
    fontSize: 15,
    fontWeight: '600',
  },
  tipoBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  tipoBadgeTexto: {
    ...TIPOGRAFIA.legenda,
    fontSize: 10,
  },
  /* Formulário */
  formulario: { gap: 4 },
  campoWrapper: { marginBottom: 8 },
  label: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.branco,
    borderWidth: 1.5,
    borderColor: CORES.borda,
    borderRadius: ESPACAMENTOS.raioBorda,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputErro: {
    borderColor: CORES_SEMANTICAS.erro,
  },
  inputIcone: { marginRight: 8 },
  input: {
    flex: 1,
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    paddingVertical: 12,
  },
  erroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  erroTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES_SEMANTICAS.erro,
  },
  avisoWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${CORES.textoSecundario}12`,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  avisoTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.textoSecundario,
    flex: 1,
    lineHeight: 18,
  },
  /* Botões */
  botoesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: ESPACAMENTOS.raioBorda,
    alignItems: 'center',
    backgroundColor: CORES.branco,
    borderWidth: 1.5,
    borderColor: CORES.borda,
  },
  textoBotaoCancelar: {
    ...TIPOGRAFIA.corpo,
    color: CORES.textoSecundario,
  },
  botaoSalvar: {
    flex: 2,
    backgroundColor: CORES.principal,
    paddingVertical: 14,
    borderRadius: ESPACAMENTOS.raioBorda,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotaoSalvar: {
    ...TIPOGRAFIA.corpo,
    color: CORES.branco,
  },
});
