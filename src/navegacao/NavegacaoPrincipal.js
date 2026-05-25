/**
 * ============================================================
 * NAVEGACAO_PRINCIPAL.JS — Configuração de Navegação do App
 * ============================================================
 * 
 * Define a estrutura de navegação do Zentrix:
 * 
 * Stack Navigator (root):
 *   ├── Inicializacao (Splash screen)
 *   ├── Principal (Bottom Tab Navigator)
 *   │   ├── Home
 *   │   ├── Transações
 *   │   ├── [+ Nova Transação] (botão central - abre modal)
 *   │   ├── Relatórios
 *   │   └── Perfil
 *   ├── DetalhesTransacao (modal)
 *   └── Notificacoes (push)
 * 
 * O botão central "+" da tab bar é customizado e abre um modal
 * para adicionar transações via frase processada pela IA.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { CORES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';

// Telas
import TelaInicializacao from '../telas/TelaInicializacao';
import TelaInicial from '../telas/TelaInicial';
import TelaTransacoes from '../telas/TelaTransacoes';
import TelaRelatorios from '../telas/TelaRelatorios';
import TelaPerfil from '../telas/TelaPerfil';
import TelaDetalhesTransacao from '../telas/TelaDetalhesTransacao';
import TelaNotificacoes from '../telas/TelaNotificacoes';
import TelaCategorias from '../telas/TelaCategorias';

// Componentes
import ModalNovaTransacao from '../componentes/ModalNovaTransacao';

/** Instâncias dos navigators */
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ===========================================
// BOTTOM TAB NAVIGATOR
// ===========================================

/**
 * Componente vazio para a tab do botão "+" central.
 * Nunca é renderizado — o botão abre um modal.
 */
const TelaVazia = () => null;

/**
 * Botão customizado do "+" central na tab bar.
 * Tem design diferente das outras tabs: círculo azul claro.
 * 
 * @param {function} aoClicar - Callback quando pressionado
 */
const BotaoCentralTabBar = ({ aoClicar }) => (
  <TouchableOpacity style={estilos.botaoCentral} onPress={aoClicar} activeOpacity={0.8}>
    <View style={estilos.botaoCentralInterno}>
      <Feather name="plus" size={28} color={CORES.principal} />
    </View>
  </TouchableOpacity>
);

/**
 * Bottom Tab Navigator com 5 tabs:
 * Home | Transações | [+] | Relatórios | Perfil
 */
const TabNavigator = () => {
  /** Controla a visibilidade do modal de nova transação */
  const [modalVisivel, setModalVisivel] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: CORES.principal,
          tabBarInactiveTintColor: CORES.textoSecundario,
          tabBarLabelStyle: {
            ...TIPOGRAFIA.legenda,
            fontSize: 11,
            marginBottom: Platform.OS === 'ios' ? 0 : 8,
          },
          tabBarStyle: {
            backgroundColor: CORES.principal,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 85 : 70,
            paddingTop: 8,
            /* Sombra superior */
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          },
          tabBarActiveTintColor: CORES.branco,
          tabBarInactiveTintColor: CORES.destaque,
        }}
      >
        <Tab.Screen
          name="Home"
          component={TelaInicial}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Transações"
          component={TelaTransacoes}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="list" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="NovaTransacao"
          component={TelaVazia}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: (props) => (
              <BotaoCentralTabBar aoClicar={() => setModalVisivel(true)} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setModalVisivel(true);
            },
          }}
        />
        <Tab.Screen
          name="Relatórios"
          component={TelaRelatorios}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="pie-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={TelaPerfil}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Modal de Nova Transação (sobrepõe as tabs) */}
      <ModalNovaTransacao
        visivel={modalVisivel}
        aoFechar={() => setModalVisivel(false)}
      />
    </>
  );
};

// ===========================================
// STACK NAVIGATOR (ROOT)
// ===========================================

/**
 * Navegação principal do app.
 * Contém o stack root que engloba:
 * - Splash screen
 * - Tab Navigator (telas principais)
 * - Telas modais (detalhes, notificações)
 */
const NavegacaoPrincipal = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen
          name="Inicializacao"
          component={TelaInicializacao}
          options={{ animation: 'fade' }}
        />
        {/* Tab Navigator (telas principais) */}
        <Stack.Screen
          name="Principal"
          component={TabNavigator}
          options={{ animation: 'fade' }}
        />
        {/* Detalhes da Transação */}
        <Stack.Screen
          name="DetalhesTransacao"
          component={TelaDetalhesTransacao}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Notificações */}
        <Stack.Screen
          name="Notificacoes"
          component={TelaNotificacoes}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Categorias (Substitui A Receber) */}
        <Stack.Screen
          name="Categorias"
          component={TelaCategorias}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ===========================================
// ESTILOS
// ===========================================

const estilos = StyleSheet.create({
  /** Estilo do botão "+" central na tab bar */
  botaoCentral: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoCentralInterno: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: CORES.destaque,
    justifyContent: 'center',
    alignItems: 'center',
    /* Borda sutil */
    borderWidth: 3,
    borderColor: CORES.branco,
    /* Sombra */
    shadowColor: CORES.principal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default NavegacaoPrincipal;
