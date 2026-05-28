# Zentrix App 📱💸

O **Zentrix** é um aplicativo gerenciador de finanças multiplataforma construído com foco na experiência do usuário e na metodologia STRIDE de segurança. O aplicativo permite que os usuários acompanhem suas transações, visualizem relatórios categorizados e gerenciem seus gastos através de uma interface rica, conectando-se a um backend serverless alimentado por AWS Lambda e integração de IA.

## 🚀 Tecnologias Utilizadas

O projeto foi inteiramente desenvolvido com um stack moderno para alta performance e interfaces fluídas:

- **React Native** & **Expo** (SDK 54) - Framework principal.
- **React Navigation** (Stack e Bottom Tabs) - Para navegação e roteamento.
- **React Native Reanimated** - Para as micro-animações (botões, transições, skeleton loaders).
- **React Native Chart Kit** - Para os gráficos financeiros e relatórios.
- **Lucide React Native** & **Expo Vector Icons** - Para a iconografia.
- **Yarn** - Gerenciador de dependências.

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes itens instalados no seu ambiente de desenvolvimento:

- [Node.js](https://nodejs.org/en/) (Versão LTS recomendada)
- [Yarn](https://yarnpkg.com/getting-started/install) (Para gerenciamento de dependências, obrigatório no Windows para evitar o limite de path do NPM)
- O aplicativo **Expo Go** no seu smartphone (iOS na App Store, Android na Google Play) ou emuladores configurados.

## 🛠️ Como Instalar

1. Clone o repositório para a sua máquina:
```bash
git clone https://github.com/SEU-USUARIO/zentrix.git
```

2. Entre no diretório do aplicativo:
```bash
cd zentrix/zentrix-app
```

3. Instale as dependências do projeto. É **altamente recomendável usar o yarn**, principalmente se você estiver utilizando Windows, devido à grande estrutura de pastas do React Native:
```bash
yarn install
```

## 🏃 Como Rodar o Projeto

Após a instalação das dependências, para rodar o projeto localmente:

1. Inicie o servidor Metro Bundler com o Expo:
```bash
npx expo start -c
```
*(A flag `-c` é recomendada para limpar o cache da bundler a cada reinício)*

2. **No iOS (iPhone)**:
   - Abra a câmera do seu celular e aponte para o QR Code que vai aparecer no terminal ou pressione a tecla `i` no terminal para rodar diretamente no Simulador do iOS (caso tenha o Xcode instalado no Mac).
   
3. **No Android**:
   - Faça o scan do QR Code usando o aplicativo do **Expo Go** ou pressione a tecla `a` no terminal para rodar no emulador do Android Studio (caso configurado).

## 🗂️ Estrutura do Projeto Frontend

A organização do código foi pensada para que qualquer novo desenvolvedor entenda rapidamente:

- `/src/componentes`: Componentes visuais isolados e reutilizáveis (Cartões, Botões, Header, etc).
- `/src/contextos`: Lógica de estado global do app (TransacoesContexto para requisições de API).
- `/src/navegacao`: Configuração e arquivos de rotas e guias (Tabs e Stack).
- `/src/servicos`: Utilitários externos como chamadas de API (Lambda AWS) e formatadores de moeda/data.
- `/src/telas`: As views principais das páginas (Home, Transações, Perfil, etc).

## 🔒 Segurança (STRIDE)

O front-end e o back-end foram arquitetados considerando os pilares STRIDE:
- Proteção contra spoofing, repúdio e interceptação no trânsito de dados (Tokens e Headers).
- A API AWS conectada restringe payloads e faz sanitação rigorosa.

---
Desenvolvido com 🩵 para o controle pleno das suas finanças.
