/**
 * ============================================================
 * MODAL_NOVA_TRANSACAO.JS — Modal para Adicionar Transação
 * ============================================================
 * 
 * Modal que abre ao clicar no botão "+" da bottom tab bar.
 * O usuário digita uma frase em linguagem natural e a IA 
 * (Gemini no backend) processa e cria a transação.
 * 
 * Exemplos de frase:
 * - "comprei um lanche de 25 reais no débito"
 * - "emprestei 500 pra João parcelado em 6 vezes"
 * - "paguei 120 reais de gasolina no pix"
 * 
 * Fluxo: 
 * 1. Usuário digita frase → 2. Envia para API → 
 * 3. IA processa → 4. Transação salva → 5. Tela atualiza
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES, CORES_SEMANTICAS } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';

/**
 * Modal para criar transação por frase processada pela IA.
 * 
 * @param {boolean} visivel - Se o modal está aberto
 * @param {function} aoFechar - Callback para fechar o modal
 */
const ModalNovaTransacao = ({ visivel, aoFechar }) => {
  /** Frase digitada pelo usuário */
  const [frase, setFrase] = useState('');
  /** Estado de envio (loading) */
  const [enviando, setEnviando] = useState(false);

  const { adicionar } = useTransacoes();

  /**
   * Envia a frase para o backend processar via IA.
   * Se sucesso, fecha o modal e limpa o campo.
   */
  const aoEnviar = async () => {
    if (!frase.trim()) {
      Alert.alert('Atenção', 'Digite uma frase descrevendo sua transação.');
      return;
    }

    setEnviando(true);
    try {
      const sucesso = await adicionar(frase.trim());
      if (sucesso) {
        Alert.alert('✅ Sucesso', 'Transação registrada com sucesso!');
        setFrase('');
        aoFechar();
      } else {
        Alert.alert('Erro', 'Não foi possível registrar a transação. Tente novamente.');
      }
    } catch (erro) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua transação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={aoFechar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.overlay}
      >
        {/* Fundo escurecido (clicável para fechar) */}
        <TouchableOpacity
          style={estilos.fundoEscuro}
          activeOpacity={1}
          onPress={aoFechar}
        />

        {/* Conteúdo do modal */}
        <View style={estilos.container}>
          {/* Barra superior de arrasto */}
          <View style={estilos.barraArrasto} />

          {/* Header do modal */}
          <View style={estilos.header}>
            <Text style={estilos.titulo}>Nova Transação</Text>
            <TouchableOpacity onPress={aoFechar}>
              <Feather name="x" size={24} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          {/* Instrução para o usuário */}
          <Text style={estilos.instrucao}>
            Descreva sua transação em linguagem natural. A IA vai processar automaticamente.
          </Text>

          {/* Exemplos de frases */}
          <View style={estilos.containerExemplos}>
            <Text style={estilos.exemploLabel}>Exemplos:</Text>
            <Text style={estilos.exemploTexto}>• "comprei um lanche de 25 reais no débito"</Text>
            <Text style={estilos.exemploTexto}>• "emprestei 500 pra João em 6 vezes"</Text>
            <Text style={estilos.exemploTexto}>• "paguei 120 de gasolina no pix"</Text>
          </View>

          {/* Campo de texto */}
          <TextInput
            style={estilos.input}
            placeholder="Digite aqui sua transação..."
            placeholderTextColor={CORES.textoSecundario}
            value={frase}
            onChangeText={setFrase}
            multiline
            numberOfLines={3}
            editable={!enviando}
            autoFocus
          />

          {/* Botão de envio */}
          <TouchableOpacity
            style={[estilos.botaoEnviar, enviando && estilos.botaoDesabilitado]}
            onPress={aoEnviar}
            disabled={enviando}
            activeOpacity={0.8}
          >
            {enviando ? (
              <ActivityIndicator color={CORES.branco} />
            ) : (
              <>
                <Feather name="send" size={20} color={CORES.branco} />
                <Text style={estilos.botaoTexto}>Registrar Transação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fundoEscuro: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: CORES.branco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: ESPACAMENTOS.margemHorizontal,
    paddingBottom: 40,
    paddingTop: 12,
  },
  barraArrasto: {
    width: 40,
    height: 4,
    backgroundColor: CORES.borda,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.textoPrincipal,
  },
  instrucao: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
    marginBottom: 12,
    lineHeight: 20,
  },
  containerExemplos: {
    backgroundColor: `${CORES.destaque}15`,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 14,
    marginBottom: 16,
  },
  exemploLabel: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.principal,
    marginBottom: 6,
  },
  exemploTexto: {
    ...TIPOGRAFIA.legenda,
    color: CORES.secundaria,
    marginBottom: 4,
    lineHeight: 18,
  },
  input: {
    ...TIPOGRAFIA.corpo,
    backgroundColor: CORES.fundo,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: CORES.textoPrincipal,
    borderWidth: 1,
    borderColor: CORES.borda,
    marginBottom: 16,
  },
  botaoEnviar: {
    backgroundColor: CORES.principal,
    borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    ...TIPOGRAFIA.corpo,
    color: CORES.branco,
    marginLeft: 10,
  },
});

export default ModalNovaTransacao;
