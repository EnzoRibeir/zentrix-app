/**
 * ============================================================
 * TELA_INICIALIZACAO.JS — Splash Screen do Zentrix
 * ============================================================
 * 
 * Primeira tela exibida ao abrir o app.
 * Mostra o logo do Zentrix com animação de fade-in e 
 * verifica se o usuário já possui sessão ativa.
 * 
 * - Se logado → navega direto para Principal
 * - Se não logado → navega para Login
 * 
 * Design: Fundo cinza claro (#EFF2F4), logo centralizada.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { useAuth } from '../contextos/AuthContexto';

/**
 * Tela de inicialização (splash) com animação de entrada.
 * Verifica sessão existente e redireciona adequadamente.
 * 
 * @param {object} navigation - Objeto de navegação do React Navigation
 */
const TelaInicializacao = ({ navigation }) => {
  const { CORES } = useTema();
  const estilos = criarEstilos(CORES);

  const { logado, verificandoSessao } = useAuth();

  /** Valor animado para o efeito de fade-in */
  const opacidade = useRef(new Animated.Value(0)).current;
  /** Valor animado para o efeito de escala */
  const escala = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animação de entrada: fade-in + scale-up
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(escala, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacidade, escala]);

  useEffect(() => {
    // Aguarda a verificação de sessão do AsyncStorage terminar
    if (verificandoSessao) return;

    // Após 2 segundos (tempo da animação), redireciona
    const temporizador = setTimeout(() => {
      if (logado) {
        // Usuário já tem sessão salva → vai direto pro app
        navigation.replace('Principal');
      } else {
        // Sem sessão → vai pra tela de login
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(temporizador);
  }, [navigation, logado, verificandoSessao]);

  return (
    <View style={estilos.container}>
      <Animated.View
        style={[
          estilos.containerLogo,
          {
            opacity: opacidade,
            transform: [{ scale: escala }],
          },
        ]}
      >
        {/* Ícone estilizado do Zentrix */}
        <View style={estilos.logoIcone}>
          <Feather name="trending-up" size={40} color={CORES.branco} />
        </View>

        {/* Nome do app */}
        <Text style={estilos.logoTexto}>Zentrix</Text>
        <Text style={estilos.logoSubtexto}>Controle Financeiro Inteligente</Text>
      </Animated.View>
    </View>
  );
};

const criarEstilos = (CORES) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLogo: {
    alignItems: 'center',
  },
  logoIcone: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: CORES.principal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    /* Sombra */
    shadowColor: CORES.principal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoTexto: {
    ...TIPOGRAFIA.valorDestaque,
    color: CORES.principal,
    letterSpacing: 2,
  },
  logoSubtexto: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.textoSecundario,
    marginTop: 8,
  },
});

export default TelaInicializacao;
