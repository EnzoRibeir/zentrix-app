/**
 * ============================================================
 * APP.JS — Entry Point do App Zentrix
 * ============================================================
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import { AuthProvider } from './src/contextos/AuthContexto';
import { TransacoesProvider } from './src/contextos/TransacoesContexto';
import { TemaProvider, useTema } from './src/contextos/TemaContexto';
import NavegacaoPrincipal from './src/navegacao/NavegacaoPrincipal';
import CarregandoIndicador from './src/componentes/CarregandoIndicador';

const AppContent = () => {
  const { isEscuro, CORES } = useTema();

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isEscuro ? "light-content" : "dark-content"} 
        backgroundColor={CORES.fundo} 
      />
      <AuthProvider>
        <TransacoesProvider>
          <NavegacaoPrincipal />
        </TransacoesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const AppRoot = () => {
  const [fontesCarregadas] = useFonts({
    Itim_400Regular,
  });

  if (!fontesCarregadas) {
    return <CarregandoIndicador mensagem="Carregando fontes..." />;
  }

  return <AppContent />;
};

export default function App() {
  return (
    <TemaProvider>
      <AppRoot />
    </TemaProvider>
  );
}
