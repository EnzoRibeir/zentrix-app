/**
 * ============================================================
 * APP.JS — Entry Point do App Zentrix
 * ============================================================
 * 
 * Arquivo principal que configura:
 * 1. Carregamento da fonte Itim (Google Fonts)
 * 2. Provider de autenticação (AuthProvider)
 * 3. Provider de estado global (TransacoesProvider)
 * 4. SafeAreaProvider para áreas seguras
 * 5. StatusBar configurada
 * 6. Navegação principal
 * 
 * Hierarquia:
 * <SafeAreaProvider>
 *   <AuthProvider>
 *     <TransacoesProvider>
 *       <NavegacaoPrincipal />
 *     </TransacoesProvider>
 *   </AuthProvider>
 * </SafeAreaProvider>
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import { AuthProvider } from './src/contextos/AuthContexto';
import { TransacoesProvider } from './src/contextos/TransacoesContexto';
import NavegacaoPrincipal from './src/navegacao/NavegacaoPrincipal';
import CarregandoIndicador from './src/componentes/CarregandoIndicador';

/**
 * Componente raiz do aplicativo.
 * Carrega fontes, configura providers e renderiza a navegação.
 */
export default function App() {
  /** Carrega a fonte Itim do Google Fonts */
  const [fontesCarregadas] = useFonts({
    Itim_400Regular,
  });

  /** Exibe loading enquanto as fontes não carregaram */
  if (!fontesCarregadas) {
    return <CarregandoIndicador mensagem="Carregando fontes..." />;
  }

  return (
    <SafeAreaProvider>
      {/* Barra de status clara (ícones escuros, fundo claro) */}
      <StatusBar barStyle="dark-content" backgroundColor="#EFF2F4" />

      {/* Provider de autenticação (deve envolver TransacoesProvider) */}
      <AuthProvider>
        {/* Provider de estado global das transações */}
        <TransacoesProvider>
          {/* Navegação principal (Stack + Tabs) */}
          <NavegacaoPrincipal />
        </TransacoesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
