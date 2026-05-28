/**
 * ============================================================
 * TELA_INICIALIZACAO.JS — Splash Screen do Zentrix
 * ============================================================
 * 
 * Primeira tela exibida ao abrir o app.
 * Mostra o logo do Zentrix com animação de fade-in e 
 * navega automaticamente para a tela principal após 2.5s.
 * 
 * Design: Fundo cinza claro (#EFF2F4), logo centralizada.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CORES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';

/**
 * Tela de inicialização (splash) com animação de entrada.
 * Redireciona para a tela principal após o tempo definido.
 * 
 * @param {object} navigation - Objeto de navegação do React Navigation
 */
const TelaInicializacao = ({ navigation }) => {
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

    // Navega para a tela principal após 2.5 segundos
    const temporizador = setTimeout(() => {
      navigation.replace('Principal');
    }, 2500);

    return () => clearTimeout(temporizador);
  }, [navigation, opacidade, escala]);

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

const estilos = StyleSheet.create({
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
