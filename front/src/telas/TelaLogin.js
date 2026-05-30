/**
 * ============================================================
 * TELA_LOGIN.JS — Autenticação via Telegram (Auto-open)
 * ============================================================
 * 
 * Quando o usuário não está logado, essa tela:
 * 1. Abre AUTOMATICAMENTE o browser com a página do Telegram
 * 2. O Telegram redireciona para o backend (server-side)
 * 3. O backend valida o hash e redireciona para zentrix://auth/callback
 * 4. O app captura a URL e salva a sessão
 * 
 * Se o browser for fechado sem login, mostra um botão de fallback.
 * 
 * Design: Gradiente + glassmorphism combinando com o app.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { CORES, GRADIENTES } from '../constantes/cores';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { useAuth } from '../contextos/AuthContexto';

// Permite que o WebBrowser retorne ao app corretamente após login
WebBrowser.maybeCompleteAuthSession();

/** URL do Lambda que serve a página HTML com o widget do Telegram */
const AUTH_PAGE_URL = 'https://agog0k90kc.execute-api.sa-east-1.amazonaws.com/default/api-financas-ia?action=telegram-login';
/** Deep link scheme que o backend redireciona de volta */
const CALLBACK_URL = 'zentrix://auth/callback';

export default function TelaLogin({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [tentouAutoLogin, setTentouAutoLogin] = useState(false);
  const { login } = useAuth();
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  /**
   * Abre o browser automaticamente quando a tela carrega.
   * Isso elimina a necessidade de clicar no botão manualmente.
   */
  useEffect(() => {
    if (!tentouAutoLogin) {
      setTentouAutoLogin(true);
      // Pequeno delay para a animação da tela aparecer primeiro
      const timer = setTimeout(() => {
        handleTelegramLogin();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [tentouAutoLogin]);

  /**
   * Processa a URL de callback retornada pelo backend.
   * O backend já validou o hash e criou o usuário.
   * A URL contém: token_sessao, user_id_interno, nome
   */
  const processarCallback = async (url) => {
    try {
      const urlObj = new URL(url);
      const params = Object.fromEntries(urlObj.searchParams.entries());

      // Verifica se houve erro no backend
      if (params.error) {
        const mensagens = {
          'hash_invalido': 'Falha na verificação de segurança. Tente novamente.',
          'expirado': 'A sessão do Telegram expirou. Tente novamente.',
          'dados_incompletos': 'Dados de autenticação incompletos.',
        };
        throw new Error(mensagens[params.error] || 'Erro na autenticação.');
      }

      // Verifica se os dados essenciais estão presentes
      if (!params.token_sessao || !params.user_id_interno) {
        throw new Error('Resposta de autenticação incompleta.');
      }

      // O backend já validou tudo — salva a sessão direto
      const dadosSessao = {
        login: true,
        token_sessao: params.token_sessao,
        user_id_interno: params.user_id_interno,
        nome: params.nome || 'Usuário',
      };

      const sucesso = await login(dadosSessao);
      if (sucesso) {
        navigation.replace('Principal');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a sessão. Tente novamente.');
      }
    } catch (erro) {
      console.error('[Login] Erro ao processar callback:', erro.message);
      Alert.alert(
        'Erro na Autenticação',
        erro.message || 'Ocorreu um erro. Tente novamente.'
      );
    }
  };

  /**
   * Abre o browser com a página do Telegram login widget.
   * O Telegram valida o usuário e redireciona para o backend.
   * O backend valida o hash e redireciona para zentrix://auth/callback.
   */
  const handleTelegramLogin = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        AUTH_PAGE_URL,
        CALLBACK_URL
      );

      if (result.type === 'success' && result.url) {
        await processarCallback(result.url);
      }
      // Se cancelou, apenas para o loading — o botão aparece pra tentar de novo
    } catch (error) {
      console.error('[Login] Erro:', error);
      Alert.alert(
        'Erro',
        'Não foi possível abrir o login do Telegram. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={GRADIENTES.principal}
      style={estilos.container}
    >
      <Animated.View style={[estilos.conteudo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* LOGO */}
        <View style={estilos.header}>
          <View style={estilos.logoCirculo}>
            <Feather name="trending-up" size={40} color={CORES.principal} />
          </View>
          <Text style={estilos.titulo}>Zentrix</Text>
          <Text style={estilos.subtitulo}>Inteligência no seu controle financeiro</Text>
        </View>

        {/* CARD */}
        <View style={estilos.glassCard}>
          <Text style={estilos.cardTitulo}>
            {loading ? 'Conectando...' : 'Bem-vindo'}
          </Text>
          <Text style={estilos.cardDescricao}>
            {loading 
              ? 'Aguarde enquanto abrimos o Telegram para autenticação segura.'
              : 'Entre com sua conta do Telegram para acessar seu painel financeiro personalizado.'
            }
          </Text>

          {/* BOTÃO DE LOGIN (fallback se o auto-open falhar ou for cancelado) */}
          {!loading && (
            <TouchableOpacity 
              style={estilos.botaoTelegram} 
              activeOpacity={0.8}
              onPress={handleTelegramLogin}
            >
              <FontAwesome5 name="telegram-plane" size={24} color={CORES.branco} style={estilos.iconeBotao} />
              <Text style={estilos.textoBotao}>Entrar com Telegram</Text>
            </TouchableOpacity>
          )}

          {/* LOADING INDICATOR */}
          {loading && (
            <View style={estilos.loadingContainer}>
              <View style={estilos.loadingDot} />
              <Text style={estilos.loadingTexto}>Abrindo o Telegram...</Text>
            </View>
          )}

          {/* INFO SEGURANÇA */}
          <View style={estilos.infoSeguranca}>
            <Feather name="shield" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={estilos.textoSeguranca}>
              Autenticação verificada via assinatura criptográfica
            </Text>
          </View>
        </View>

      </Animated.View>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCirculo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CORES.branco,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  titulo: {
    ...TIPOGRAFIA.tituloGrande,
    color: CORES.branco,
    fontSize: 48,
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitulo: {
    ...TIPOGRAFIA.corpo,
    color: CORES.destaque,
    textAlign: 'center',
    opacity: 0.9,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    } : {
      elevation: 5,
    }),
  },
  cardTitulo: {
    ...TIPOGRAFIA.tituloMedio,
    color: CORES.branco,
    marginBottom: 10,
  },
  cardDescricao: {
    ...TIPOGRAFIA.corpoPequeno,
    color: CORES.branco,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
    lineHeight: 22,
  },
  botaoTelegram: {
    width: '100%',
    height: 56,
    backgroundColor: '#0088cc',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  iconeBotao: {
    marginRight: 12,
  },
  textoBotao: {
    ...TIPOGRAFIA.subtitulo,
    color: CORES.branco,
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0088cc',
    marginBottom: 12,
  },
  loadingTexto: {
    ...TIPOGRAFIA.corpoPequeno,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoSeguranca: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  textoSeguranca: {
    ...TIPOGRAFIA.legenda,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
