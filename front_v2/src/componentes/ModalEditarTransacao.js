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
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';

export default function ModalEditarTransacao({ visivel, aoFechar, transacao }) {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { atualizar } = useTransacoes();
  const [descricao, setDescricao] = useState(transacao?.description || '');
  const [valor, setValor] = useState(transacao?.amount ? String(transacao.amount) : '');
  const [carregando, setCarregando] = useState(false);

  // Sincroniza estado quando modal abre
  React.useEffect(() => {
    if (visivel && transacao) {
      setDescricao(transacao.description || '');
      setValor(transacao.amount ? String(transacao.amount) : '');
    }
  }, [visivel, transacao]);

  const handleSalvar = async () => {
    if (!descricao.trim() || !valor.trim()) return;

    setCarregando(true);
    const campos = {
      description: descricao,
      amount: parseFloat(valor.replace(',', '.'))
    };
    
    const sucesso = await atualizar(transacao.id, campos);
    setCarregando(false);
    
    if (sucesso) {
      aoFechar(campos);
    }
  };

  if (!transacao) return null;

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
            <Text style={estilos.titulo}>Editar Transação</Text>
            <TouchableOpacity onPress={() => aoFechar()} disabled={carregando}>
              <Feather name="x" size={24} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          <View style={estilos.formulario}>
            <Text style={estilos.label}>Descrição</Text>
            <TextInput
              style={estilos.input}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex: Almoço"
              editable={!carregando}
            />

            <Text style={estilos.label}>Valor (R$)</Text>
            <TextInput
              style={estilos.input}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder="0.00"
              editable={!carregando}
            />

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
