/**
 * ============================================================
 * TELA_PERFIL.JS — Tela de Perfil do Usuário
 * ============================================================
 * 
 * Exibe informações do perfil do usuário e configurações:
 * 1. Dados pessoais (nome, email, telefone, etc.)
 * 2. Resumo da conta (saldo, total gasto, limite, salário)
 * 3. Configurações (dados pessoais, notificações, modo escuro)
 * 4. Botão de sair
 * 
 * Dados de perfil: Mockados (backend não tem endpoint de perfil ainda).
 * Dados financeiros: Calculados a partir das transações reais.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CORES_SEMANTICAS } from '../constantes/cores';
import { useTema } from '../contextos/TemaContexto';
import { TIPOGRAFIA } from '../constantes/tipografia';
import { ESPACAMENTOS } from '../constantes/espacamentos';
import { useTransacoes } from '../contextos/TransacoesContexto';
import { useAuth } from '../contextos/AuthContexto';
import { useNotificacoes } from '../contextos/NotificacoesContexto';
import { formatarMoeda } from '../utilitarios/formatadores';
import { calcularTotalGasto, calcularSaldo } from '../utilitarios/calculadores';
import CartaoResumo from '../componentes/CartaoResumo';
import ModalEditarPerfil from '../componentes/ModalEditarPerfil';

/** Limite mensal padrão se não definido */
const LIMITE_PADRAO = 1000;
/** Salário padrão se não definido */
const SALARIO_PADRAO = 5000;

/**
 * Dados mockados do perfil do usuário.
 * TODO: Futuramente virão de um endpoint GET /perfil no backend.
 */
const PERFIL_MOCKADO = {
  nome: 'Enzo Ribeiro',
  email: 'enzodesenveloper@gmail.com',
  dataNascimento: '02, abr 2006',
  telefone: '(11) 4002-8922',
  localizacao: 'São Paulo, SP',
};

/**
 * Tela de perfil do usuário com configurações.
 * 
 * @param {object} navigation - Navegação do React Navigation
 */
const TelaPerfil = ({ navigation }) => {
  const { CORES, isEscuro, alternarTema } = useTema();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilos(CORES, insets);

  const { transacoes, usuario, carregar } = useTransacoes();
  const { usuario: usuarioAuth, logout } = useAuth();
  const { naoLidosCount } = useNotificacoes();
  const [modalPerfilVisivel, setModalPerfilVisivel] = useState(false);
  const [campoAlvo, setCampoAlvo] = useState(null);
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const salarioReal = usuario?.salario_mensal || SALARIO_PADRAO;
  const limiteReal = usuario?.limite_mensal || LIMITE_PADRAO;
  const totalGasto = calcularTotalGasto(transacoes);
  const saldo = salarioReal - totalGasto;

  /** Renderiza uma linha de configuração com ícone, texto e ação */
  const abrirModal = (campo) => {
    setCampoAlvo(campo);
    setModalPerfilVisivel(true);
  };
  const ItemConfig = ({ icone, corIcone, titulo, descricao, aoClicar, componente }) => (
    <TouchableOpacity
      style={estilos.itemConfig}
      onPress={aoClicar}
      activeOpacity={aoClicar ? 0.7 : 1}
    >
      <View style={[estilos.itemConfigIcone, { backgroundColor: `${corIcone || CORES.principal}15` }]}>
        <Feather name={icone} size={20} color={corIcone || CORES.principal} />
      </View>
      <View style={estilos.itemConfigTexto}>
        <Text style={estilos.itemConfigTitulo}>{titulo}</Text>
        <Text style={estilos.itemConfigDescricao}>{descricao}</Text>
      </View>
      {componente || <Feather name="chevron-right" size={20} color={CORES.textoSecundario} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <View style={estilos.header}>
        {buscaVisivel ? (
          <View style={estilos.barraBusca}>
            <Feather name="search" size={18} color={CORES.textoSecundario} style={{ marginRight: 8 }} />
            <TextInput
              style={estilos.inputBusca}
              placeholder="Buscar transações..."
              placeholderTextColor={CORES.textoSecundario}
              value={termoBusca}
              onChangeText={setTermoBusca}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setBuscaVisivel(false); setTermoBusca(''); }}>
              <Feather name="x" size={18} color={CORES.textoSecundario} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={estilos.titulo}>Meu Perfil</Text>
            <View style={estilos.headerIcones}>
              <TouchableOpacity style={estilos.iconeBotao} onPress={() => setBuscaVisivel(true)}>
                <Feather name="search" size={22} color={CORES.principal} />
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.iconeBotao}
                onPress={() => navigation.navigate('Notificacoes')}
              >
                <Feather name="bell" size={22} color={CORES.principal} />
                {naoLidosCount > 0 && (
                  <View style={estilos.badge}>
                    <Text style={estilos.badgeTexto}>
                      {naoLidosCount > 9 ? '9+' : naoLidosCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ============================================ */}
      {/* CARD: Dados do Usuário */}
      {/* ============================================ */}
      <TouchableOpacity style={estilos.cardUsuario}>
        <View style={estilos.cardUsuarioInfo}>
          <Text style={estilos.nomeUsuario}>{usuarioAuth?.nome || 'Usuário'}</Text>
          <Text style={estilos.emailUsuario}>Conta Telegram • ID: {usuarioAuth?.user_id || '---'}</Text>
        </View>
        <Feather name="chevron-right" size={24} color={CORES.textoSecundario} />
      </TouchableOpacity>

      {/* Dados pessoais em linha */}
      <View style={estilos.dadosPessoais}>
        <View style={estilos.dadoItem}>
          <Feather name="calendar" size={16} color={CORES.textoSecundario} />
          <View style={estilos.dadoItemTexto}>
            <Text style={estilos.dadoLabel}>Data de Nascimento</Text>
            <Text style={estilos.dadoValor}>{PERFIL_MOCKADO.dataNascimento}</Text>
          </View>
        </View>
        <View style={estilos.dadoItem}>
          <Feather name="phone" size={16} color={CORES.textoSecundario} />
          <View style={estilos.dadoItemTexto}>
            <Text style={estilos.dadoLabel}>Telefone</Text>
            <Text style={estilos.dadoValor}>{PERFIL_MOCKADO.telefone}</Text>
          </View>
        </View>
        <View style={estilos.dadoItem}>
          <Feather name="map-pin" size={16} color={CORES.textoSecundario} />
          <View style={estilos.dadoItemTexto}>
            <Text style={estilos.dadoLabel}>Localização</Text>
            <Text style={estilos.dadoValor}>{PERFIL_MOCKADO.localizacao}</Text>
          </View>
        </View>
      </View>

      {/* ============================================ */}
      {/* SEÇÃO: Resumo da Conta (4 cards) */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Resumo da sua conta</Text>
      <View style={estilos.gridResumo}>
        <CartaoResumo
          icone="dollar-sign"
          label="Saldo Atual"
          valor={formatarMoeda(saldo)}
          corValor={CORES_SEMANTICAS.sucesso}
          corIcone={CORES_SEMANTICAS.sucesso}
        />
        <View style={{ width: 10 }} />
        <CartaoResumo
          icone="arrow-down-left"
          label="Total Gasto"
          valor={formatarMoeda(totalGasto)}
          corValor={CORES_SEMANTICAS.erro}
          corIcone={CORES_SEMANTICAS.erro}
        />
      </View>
      <View style={[estilos.gridResumo, { marginTop: 10 }]}>
        <CartaoResumo
          icone="credit-card"
          label="Limite Mensal"
          valor={formatarMoeda(limiteReal)}
          corValor={CORES.textoPrincipal}
          corIcone={CORES.secundaria}
          onPress={() => abrirModal('limite')}
        />
        <View style={{ width: 10 }} />
        <CartaoResumo
          icone="briefcase"
          label="Salário"
          valor={formatarMoeda(salarioReal)}
          corValor={CORES_SEMANTICAS.sucesso}
          corIcone={CORES_SEMANTICAS.sucesso}
          onPress={() => abrirModal('salario')}
        />
      </View>
      <View style={[estilos.gridResumo, { marginTop: 10 }]}>
        <CartaoResumo
          icone="calendar"
          label="Dia do Vencimento"
          valor={usuario?.dia_vencimento_fatura ? `Dia ${usuario.dia_vencimento_fatura}` : 'Não definido'}
          corValor={CORES.textoPrincipal}
          corIcone={CORES.principal}
          onPress={() => abrirModal('vencimento')}
        />
        <View style={{ width: 10 }} />
        <View style={{ flex: 1 }} />
      </View>

      {/* ============================================ */}
      {/* SEÇÃO: Configurações */}
      {/* ============================================ */}
      <Text style={estilos.secaoTitulo}>Configurações</Text>
      <View style={estilos.cardConfig}>
        <ItemConfig
          icone="bell"
          titulo="Notificações"
          descricao="Gerencie suas notificações"
          aoClicar={() => navigation.navigate('Notificacoes')}
        />
        <View style={estilos.separador} />
        <ItemConfig
          icone="moon"
          titulo="Modo Escuro"
          descricao="Alterne entre o modo Claro e o Modo Escuro"
          componente={
            <Switch
              value={isEscuro}
              onValueChange={alternarTema}
              trackColor={{ false: CORES.borda, true: CORES.principal }}
              thumbColor={CORES.branco}
            />
          }
        />
      </View>

      {/* ============================================ */}
      {/* BOTÃO: Sair da Conta */}
      {/* ============================================ */}
      <TouchableOpacity
        style={estilos.botaoSair}
        onPress={() =>
          Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: async () => {
              await logout();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }},
          ])
        }
      >
        <View style={estilos.sairIcone}>
          <Feather name="log-out" size={20} color={CORES_SEMANTICAS.erro} />
        </View>
        <View style={estilos.sairTexto}>
          <Text style={estilos.sairTitulo}>Sair da conta</Text>
          <Text style={estilos.sairDescricao}>Encerrar sessão neste dispositivo</Text>
        </View>
        <Feather name="chevron-right" size={20} color={CORES.textoSecundario} />
      </TouchableOpacity>

      <ModalEditarPerfil
        visivel={modalPerfilVisivel}
        campoAlvo={campoAlvo}
        aoFechar={async (novosCampos) => {
          setModalPerfilVisivel(false);
          setCampoAlvo(null);
          if (novosCampos) {
            await carregar(); // Recarrega os dados para pegar as atualizações
          }
        }}
        usuarioAtual={usuario}
      />
    </ScrollView>
  );
};

const criarEstilos = (CORES, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: {
    padding: ESPACAMENTOS.margemHorizontal,
    paddingTop: (insets?.top || 0) + 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  titulo: { ...TIPOGRAFIA.tituloMedio, color: CORES.textoPrincipal },
  headerIcones: { flexDirection: 'row', gap: 10 },
  iconeBotao: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: CORES.branco,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeTexto: { color: '#fff', fontSize: 9, fontWeight: '700' },
  barraBusca: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: CORES.branco, borderRadius: 23, paddingHorizontal: 16, height: 46,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputBusca: { flex: 1, ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal, padding: 0 },
  /* Card Usuário */
  cardUsuario: {
    backgroundColor: CORES.branco, borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardUsuarioInfo: { flex: 1 },
  nomeUsuario: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal, marginBottom: 4 },
  emailUsuario: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario },
  /* Dados pessoais */
  dadosPessoais: {
    backgroundColor: CORES.branco, borderRadius: ESPACAMENTOS.raioBorda,
    padding: ESPACAMENTOS.paddingCard, flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  dadoItem: { alignItems: 'center', flex: 1 },
  dadoItemTexto: { alignItems: 'center', marginTop: 6 },
  dadoLabel: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, fontSize: 10, textAlign: 'center' },
  dadoValor: { ...TIPOGRAFIA.legenda, color: CORES.textoPrincipal, textAlign: 'center', marginTop: 2 },
  /* Seções */
  secaoTitulo: { ...TIPOGRAFIA.subtitulo, color: CORES.textoPrincipal, marginBottom: 12, marginTop: 16 },
  gridResumo: { flexDirection: 'row' },
  /* Config */
  cardConfig: {
    backgroundColor: CORES.branco, borderRadius: ESPACAMENTOS.raioBorda,
    padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  itemConfig: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  itemConfigIcone: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  itemConfigTexto: { flex: 1 },
  itemConfigTitulo: { ...TIPOGRAFIA.corpo, color: CORES.textoPrincipal },
  itemConfigDescricao: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginTop: 2 },
  separador: { height: 1, backgroundColor: CORES.borda, marginLeft: 70 },
  /* Sair */
  botaoSair: {
    backgroundColor: CORES.branco, borderRadius: ESPACAMENTOS.raioBorda,
    padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: ESPACAMENTOS.espacoEntreCards,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sairIcone: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: `${CORES_SEMANTICAS.erro}15`,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  sairTexto: { flex: 1 },
  sairTitulo: { ...TIPOGRAFIA.corpo, color: CORES_SEMANTICAS.erro },
  sairDescricao: { ...TIPOGRAFIA.legenda, color: CORES.textoSecundario, marginTop: 2 },
});

export default TelaPerfil;
