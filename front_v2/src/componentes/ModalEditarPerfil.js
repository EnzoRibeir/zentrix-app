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
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
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

  React.useEffect(() => {
    if (visivel && usuarioAtual) {
      setSalario(usuarioAtual.salario_mensal ? String(usuarioAtual.salario_mensal) : '');
      setLimite(usuarioAtual.limite_mensal ? String(usuarioAtual.limite_mensal) : '');
      setDiaVencimento(usuarioAtual.dia_vencimento_fatura ? String(usuarioAtual.dia_vencimento_fatura) : '');
    }
  }, [visivel, usuarioAtual]);

  const handleSalvar = async () => {
    setCarregando(true);
    const campos = {
      salario_mensal: parseFloat(salario.replace(',', '.')) || null,
      limite_mensal: parseFloat(limite.replace(',', '.')) || null,
      dia_vencimento_fatura: parseInt(diaVencimento, 10) || null,
    };
    
    try {
      await atualizarUsuario(usuarioAuth?.user_id, campos);
      aoFechar(campos);
    } catch (e) {
      alert('Erro ao atualizar perfil');
      aoFechar();
    } finally {
      setCarregando(false);
    }
  };

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
          <View style={estilos.header}>
            <Text style={estilos.titulo}>
              {campoAlvo === 'salario' && 'Editar Salário'}
              {campoAlvo === 'limite' && 'Editar Limite Mensal'}
              {campoAlvo === 'vencimento' && 'Editar Vencimento'}
            </Text>
            <TouchableOpacity onPress={() => aoFechar()} disabled={carregando}>
              <Feather name="x" size={24} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          <View style={estilos.formulario}>
            {campoAlvo === 'salario' && (
              <>
                <Text style={estilos.label}>Salário Mensal (R$)</Text>
                <TextInput
                  style={estilos.input}
                  value={salario}
                  onChangeText={setSalario}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  editable={!carregando}
                  autoFocus
                />
              </>
            )}

            {campoAlvo === 'limite' && (
              <>
                <Text style={estilos.label}>Limite Mensal (R$)</Text>
                <TextInput
                  style={estilos.input}
                  value={limite}
                  onChangeText={setLimite}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  editable={!carregando}
                  autoFocus
                />
              </>
            )}

            {campoAlvo === 'vencimento' && (
              <>
                <Text style={estilos.label}>Dia de Vencimento da Fatura</Text>
                <TextInput
                  style={estilos.input}
                  value={diaVencimento}
                  onChangeText={setDiaVencimento}
                  keyboardType="number-pad"
                  placeholder="Ex: 5"
                  editable={!carregando}
                  autoFocus
                />
              </>
            )}

            <TouchableOpacity 
              style={[estilos.botaoSalvar, carregando && estilos.botaoDesabilitado]} 
              onPress={handleSalvar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={CORES.branco} />
              ) : (
                <Text style={estilos.textoBotaoSalvar}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const criarEstilos = (CORES) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CORES.fundo,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: ESPACAMENTOS.l,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ESPACAMENTOS.l,
  },
  titulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
  },
  formulario: {
    gap: 8,
  },
  label: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
  },
  input: {
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.m,
    ...TIPOGRAFIA.corpo,
    color: CORES.textoPrincipal,
    marginBottom: ESPACAMENTOS.m,
  },
  botaoSalvar: {
    backgroundColor: CORES.principal,
    padding: ESPACAMENTOS.m,
    borderRadius: ESPACAMENTOS.raioBorda,
    alignItems: 'center',
    marginTop: ESPACAMENTOS.s,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotaoSalvar: {
    ...TIPOGRAFIA.corpo,
    color: CORES.branco,
  }
});
