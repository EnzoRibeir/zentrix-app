# Zentrix 📱💸

**Zentrix** é um ecossistema inteligente de controle financeiro multiplataforma desenvolvido como projeto interdisciplinar universitário. Diferente de aplicativos tradicionais, ele mescla um frontend rico e moderno com um backend serverless potencializado por Inteligência Artificial (Google Gemini) e autenticação segura via Telegram.

O projeto foi inteiramente arquitetado com foco na **Segurança da Informação** (utilizando a metodologia de modelagem de ameaças **STRIDE**), alta escalabilidade e uma excelente Experiência de Usuário (UX).

---

## 🏗️ Arquitetura do Sistema

O Zentrix opera de forma distribuída, separando claramente as responsabilidades entre cliente e servidor, garantindo segurança e escalabilidade.

1. **Frontend (App Mobile & Web):** Desenvolvido em React Native via Expo. É a camada de interação direta com o usuário, projetada para ser responsiva, rápida e focada em micro-animações para uma interface premium.
2. **Backend (Serverless / AWS Lambda):** Desenvolvido em Python 3.11. Atua como intermediário seguro da aplicação. Não há servidores rodando 24/7; a arquitetura é baseada em eventos, o que reduz custos e superfície de ataques.
3. **Banco de Dados (AWS RDS MySQL):** Banco relacional em nuvem, armazenando informações de usuários, sessões temporárias e transações criptografadas.
4. **Inteligência Artificial (Google Gemini 2.5 Flash):** Através do Bot do Telegram, o usuário pode enviar um áudio ou digitar de forma livre (ex: *"Gastei 50 reais no ifood parcelado em 2x"*). A IA processa a linguagem natural (NLP), extrai categorias, datas, valores e parcelas, enviando o JSON estruturado para o Backend.
5. **Autenticação (Telegram Login Widget):** Em vez de armazenar senhas brutas no banco, delegamos a segurança de credenciais ao Telegram, validando as sessões internamente com tokens opacos (UUIDs) e criptografia HMAC-SHA256.

---

## 🚀 Como o App Funciona?

O aplicativo possui dois principais pontos de entrada e gestão:
* **O App Zentrix:** Onde o usuário pode visualizar seu *Dashboard* inteligente, que calcula automaticamente parcelas de compras antigas que estão incidindo no mês atual. O usuário tem visão de relatórios gráficos de categorias, balanço de limites e edição de perfil.
* **O Bot do Telegram (ZentrixBot):** Um assistente financeiro no chat. O usuário cadastra despesas usando linguagem natural e pode pedir um `/resumo` que utiliza o Google Gemini para analisar os gastos e gerar *insights* personalizados sobre as finanças do mês.

---

## 🛡️ Segurança e o Modelo STRIDE

Toda a arquitetura do Zentrix foi construída com o princípio *Security by Design*, mapeando e mitigando ameaças baseadas no modelo **STRIDE** da Microsoft.

### S - Spoofing (Falsificação de Identidade)
* **Mitigação:** O login clássico com senhas vulneráveis foi substituído pelo **Telegram Login Widget**. O servidor valida rigorosamente a autenticidade dos dados gerando um hash `HMAC-SHA256` utilizando o Token Secreto do Bot. As sessões internas utilizam Tokens Aleatórios Fortes (UUIDv4) com tempo de expiração rigoroso.

### T - Tampering (Adulteração de Dados)
* **Mitigação:** Consultas ao banco de dados utilizam exclusivamente **Parameterized Queries** (Prepared Statements) da biblioteca `pymysql`, neutralizando completamente ataques de *SQL Injection*. Na comunicação API, as políticas de **CORS** bloqueiam requisições de origens não autorizadas. 

### R - Repudiation (Repúdio)
* **Mitigação:** Logs de sistema detalhados são mantidos pelo AWS CloudWatch (sem dados sensíveis). Todas as transações estão atreladas a um identificador imutável do usuário no banco de dados.

### I - Information Disclosure (Vazamento de Informações)
* **Mitigação:** 
  1. A comunicação entre o App e a API é feita exclusivamente sobre TLS 1.2+ (HTTPS).
  2. Tratamento rigoroso de Erros (Status 500) que não expõem *Tracebacks* da linguagem ou versões do servidor para o cliente.
  3. No banco de dados, senhas brutas nunca existiram. Em versões iniciais de testes, foram desativadas e substituídas pela dupla camada de Autenticação do Telegram.
  4. Dados enviados para a IA (Gemini) sofrem sanitização; processa-se apenas o prompt e o extrato financeiro sob demanda temporária.

### D - Denial of Service (Negação de Serviço)
* **Mitigação:** A infraestrutura **Serverless (AWS Lambda)** garante escalonamento horizontal automático frente a picos de requisições. Para relatórios pesados (como exportação de CSV), existem limites rígidos de linhas por consulta para evitar consumo excessivo de memória (OOM).

### E - Elevation of Privilege (Elevação de Privilégio)
* **Mitigação:** Inexistência de vulnerabilidades **IDOR** (Insecure Direct Object Reference). Em todas as rotas (DELETE, PUT, GET), o recurso sempre inclui a validação `AND user_id = %s`. Um usuário autenticado nunca conseguirá excluir, editar ou ler transações de outro usuário, mesmo adivinhando o ID da transação no payload da requisição.

---

## 🎨 Como foi feito o Frontend

O design foca na experiência nativa (*Premium Feel*) do usuário, abolindo layouts complexos em prol de usabilidade clara.

- **Tecnologias:** Desenvolvido no ecossistema **React Native** suportado pelo framework **Expo** (SDK 54).
- **Gestão de Estado Global:** Evitando dependências externas (como Redux), todo o controle financeiro, de autenticação e de modo Dark/Light é gerenciado eficientemente pela **Context API** nativa do React.
- **Animações e Interações:** Micro-animações em modais, feedback visual imediato para falhas e navegação suave feita através do `React Navigation`.
- **Organização de Código (Modularização):** 
  - `/src/componentes/`: Interfaces reutilizáveis (Botões, Modais, Cards).
  - `/src/telas/`: Telas e exibições inteiras geridas pelo roteador.
  - `/src/utilitarios/`: Motor de cálculo isolado (rateio de parcelamentos dinâmicos ao longo dos meses).
  - `/src/servicos/`: Centralização do wrapper `fetch` para comunicação segura com a API AWS, injetando automaticamente os JWT Tokens.

---

## 🛠️ Como Instalar e Rodar Localmente

Certifique-se de ter instalado no seu ambiente de desenvolvimento:
- [Node.js](https://nodejs.org/en/)
- O gerenciador de pacotes **Yarn**
- O aplicativo **Expo Go** no seu smartphone (Android/iOS)

### Passo a Passo

1. Clone o repositório e navegue até a pasta do frontend:
```bash
git clone https://github.com/SEU-USUARIO/zentrix.git
cd zentrix/zentrix-app/front_v2
```

2. Instale as dependências rigorosas da aplicação utilizando o Yarn:
```bash
yarn install
```

3. Inicie o servidor do Metro Bundler (recomendável com limpeza de cache):
```bash
npx expo start -c
```

4. **Testando no Smartphone:**
   - **Para iOS:** Abra a câmera do seu celular e escaneie o QR Code que apareceu no terminal.
   - **Para Android:** Baixe o aplicativo "Expo Go", abra-o, e clique em "Scan QR Code".

Pronto! A interface estará rodando no seu dispositivo e já se comunicando ativamente com o backend Serverless configurado na nuvem.

---
*Projeto Interdisciplinar - Criado com foco total em Engenharia de Software Segura e Inovação Financeira.*
