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
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { atualizarUsuario } from '../servicos/api';
import { useAuth } from '../contextos/AuthContexto';

export default function ModalEditarPerfil({ visivel, aoFechar, usuarioAtual, campoAlvo }) {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { usuario: usuarioAuth } = useAuth();
  const [salario, setSalario] = useState(usuarioAtual?.salario_mensal ? String(usuarioAtual.salario_mensal) : '');
  const [limite, setLimite] = useState(usuarioAtual?.limite_mensal ? String(usuarioAtual.limite_mensal) : '');
  const [diaVencimento, setDiaVencimento] = useState(usuarioAtual?.dia_vencimento_fatura ? String(usuarioAtual.dia_vencimento_fatura) : '');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  React.useEffect(() => {
    if (visivel && usuarioAtual) {
      setSalario(usuarioAtual.salario_mensal ? String(usuarioAtual.salario_mensal) : '');
      setLimite(usuarioAtual.limite_mensal ? String(usuarioAtual.limite_mensal) : '');
      setDiaVencimento(usuarioAtual.dia_vencimento_fatura ? String(usuarioAtual.dia_vencimento_fatura) : '');
      setErro('');
    }
  }, [visivel, usuarioAtual]);

  const getInfoCard = () => {
    switch (campoAlvo) {
      case 'salario':
        return { icone: 'briefcase', corFundo: '#E8F5E9', corIcone: CORES_SEMANTICAS.sucesso, titulo: 'Salário Atual', subtitulo: 'Configure sua renda principal', placeholder: '0,00' };
      case 'limite':
        return { icone: 'credit-card', corFundo: '#FFF3E0', corIcone: CORES.secundaria, titulo: 'Limite Mensal', subtitulo: 'Teto de gastos para o mês', placeholder: '0,00' };
      case 'vencimento':
        return { icone: 'calendar', corFundo: '#E3F2FD', corIcone: CORES.principal, titulo: 'Dia de Vencimento', subtitulo: 'Fechamento da sua fatura', placeholder: 'Ex: 5' };
      default:
        return { icone: 'user', corFundo: '#eee', corIcone: '#333', titulo: '', subtitulo: '', placeholder: '' };
    }
  };

  const handleSalvar = async () => {
    setErro('');
    let valido = true;

    if (campoAlvo === 'salario' && (!salario.trim() || isNaN(parseFloat(salario.replace(',', '.'))))) {
      setErro('Informe um valor de salário válido.');
      valido = false;
    }
    if (campoAlvo === 'limite' && (!limite.trim() || isNaN(parseFloat(limite.replace(',', '.'))))) {
      setErro('Informe um limite de gastos válido.');
      valido = false;
    }
    if (campoAlvo === 'vencimento') {
      const dia = parseInt(diaVencimento, 10);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        setErro('Informe um dia de vencimento válido (1 a 31).');
        valido = false;
      }
    }

    if (!valido) return;

    setCarregando(true);
    const campos = {};
    if (campoAlvo === 'salario') campos.salario_mensal = parseFloat(salario.replace(',', '.')) || null;
    if (campoAlvo === 'limite') campos.limite_mensal = parseFloat(limite.replace(',', '.')) || null;
    if (campoAlvo === 'vencimento') campos.dia_vencimento_fatura = parseInt(diaVencimento, 10) || null;
    
    try {
      await atualizarUsuario(usuarioAuth?.user_id, campos);
      aoFechar(campos);
    } catch (e) {
      setErro(e.message || 'Erro ao salvar os dados.');
    } finally {
      setCarregando(false);
    }
  };

  const info = getInfoCard();

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

          <View style={estilos.header}>
            <View style={estilos.headerTexto}>
              <Text style={estilos.titulo}>
                {campoAlvo === 'salario' && 'Editar Salário'}
                {campoAlvo === 'limite' && 'Editar Limite Mensal'}
                {campoAlvo === 'vencimento' && 'Editar Vencimento'}
              </Text>
              <Text style={estilos.subtituloHeader}>{info.subtitulo}</Text>
            </View>
            <TouchableOpacity onPress={() => aoFechar()} disabled={carregando} style={estilos.botaoFechar}>
              <Feather name="x" size={20} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          {/* Info card decorativo */}
          <View style={estilos.infoCard}>
            <View style={[estilos.iconeCategoria, { backgroundColor: info.corFundo }]}>
              <Feather name={info.icone} size={22} color={info.corIcone} />
            </View>
            <View style={estilos.infoTextos}>
              <Text style={estilos.infoDescricao} numberOfLines={1}>{info.titulo}</Text>
              <Text style={estilos.infoCategoria}>Ajuste seu perfil financeiro</Text>
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={estilos.formulario}>
              <View style={estilos.campoWrapper}>
                <Text style={estilos.label}>Novo Valor</Text>
                <View style={[estilos.inputWrapper, erro ? estilos.inputErro : null]}>
                  {campoAlvo !== 'vencimento' && (
                    <Feather name="dollar-sign" size={16} color={CORES.textoSecundario} style={estilos.inputIcone} />
                  )}
                  {campoAlvo === 'vencimento' && (
                    <Feather name="calendar" size={16} color={CORES.textoSecundario} style={estilos.inputIcone} />
                  )}
                  
                  {campoAlvo === 'salario' && (
                    <TextInput
                      style={estilos.input}
                      value={salario}
                      onChangeText={(t) => { setSalario(t); setErro(''); }}
                      keyboardType="decimal-pad"
                      placeholder={info.placeholder}
                      placeholderTextColor={CORES.textoSecundario}
                      editable={!carregando}
                      autoFocus
                    />
                  )}
                  {campoAlvo === 'limite' && (
                    <TextInput
                      style={estilos.input}
                      value={limite}
                      onChangeText={(t) => { setLimite(t); setErro(''); }}
                      keyboardType="decimal-pad"
                      placeholder={info.placeholder}
                      placeholderTextColor={CORES.textoSecundario}
                      editable={!carregando}
                      autoFocus
                    />
                  )}
                  {campoAlvo === 'vencimento' && (
                    <TextInput
                      style={estilos.input}
                      value={diaVencimento}
                      onChangeText={(t) => { setDiaVencimento(t); setErro(''); }}
                      keyboardType="number-pad"
                      placeholder={info.placeholder}
                      placeholderTextColor={CORES.textoSecundario}
                      editable={!carregando}
                      autoFocus
                    />
                  )}
                </View>
                {!!erro && (
                  <View style={estilos.erroRow}>
                    <Feather name="alert-circle" size={12} color={CORES_SEMANTICAS.erro} />
                    <Text style={estilos.erroTexto}>{erro}</Text>
                  </View>
                )}
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
    borderLeftColor: CORES.principal,
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
