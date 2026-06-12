# Roteiro de Apresentação - Zentrix 📱💸

Este documento contém o roteiro técnico detalhado para a apresentação do projeto Zentrix, com foco na arquitetura, segurança, desenvolvimento mobile e possíveis perguntas da banca avaliadora.

---

## 1. O que é o Zentrix? (Visão Geral)
O **Zentrix** é um ecossistema inteligente de controle financeiro multiplataforma. Diferente dos aplicativos tradicionais onde você precisa preencher formulários extensos, ele mescla uma interface rica (Frontend) com um motor inteligente (Backend Serverless) potencializado por Inteligência Artificial. O grande foco do projeto foi construir algo inovador com a fundação totalmente baseada em Segurança da Informação (*Security by Design*).

### 1.1 O Grande Diferencial: IA e Autenticação
*   **Entrada de Dados via Inteligência Natural:** O usuário pode simplesmente mandar uma mensagem no Bot do Telegram do projeto (ex: *"Gastei 50 reais no iFood parcelado em 2x"*). O backend se comunica com a IA **Google Gemini (2.5 Flash)**, que extrai o valor, a categoria e as parcelas, salvando tudo estruturado no banco de dados.
*   **Autenticação sem Senhas (Passwordless):** Para evitar o armazenamento de senhas vulneráveis, o projeto utiliza o **Telegram Login Widget**. O servidor valida a identidade criptograficamente via `HMAC-SHA256`, garantindo segurança sem o risco de vazamento de credenciais.

---

## 2. Frontend (Aplicativo Mobile)
O foco no Frontend foi criar uma **alta performance** com uma **experiência de usuário (UX) premium**, abandonando práticas e bibliotecas legadas ou pesadas.

*   **Stack Tecnológica:** Desenvolvido utilizando o ecossistema **React Native** suportado pelo framework **Expo** (SDK 54). Permite o desenvolvimento *Cross-Platform* (iOS e Android com o mesmo código).
*   **Arquitetura Modular:** Código estritamente separado por responsabilidades (`/componentes`, `/telas`, `/contextos`, `/navegacao`, `/servicos`).
*   **Gerenciamento de Estado:** **Sem Redux**. O projeto aproveita a **Context API** nativa do React, o que é suficiente e muito mais performático para lidar com estado do usuário e *Dark/Light Mode*.
*   **Animações (Premium Feel):** Utiliza `react-native-reanimated` para rodar as animações na *Thread* Nativa de UI a 60 frames por segundo. Gradientes e gráficos com `expo-linear-gradient` e `react-native-chart-kit`.
*   **Segurança no Cliente:** O Token de Sessão é salvo e encriptado usando o **Keychain** (iOS) e o **Keystore** (Android) através do `expo-secure-store`.

---

## 3. Backend e Arquitetura Serverless
O backend é o motor de processamento, desenhado para ser enxuto, inteligente e seguro.

*   **Paradigma Serverless (AWS Lambda):** Escrito em **Python 3.11**. O código não fica em um servidor rodando 24 horas. Ele "acorda", executa e consome recursos apenas quando um evento acontece. Isso garante **redução de custos** e **escalabilidade horizontal infinita**.
*   **Padrão "Single Entry Point":** O arquivo `v12.py` possui uma função raiz `lambda_handler` que atua como um roteador principal (Front Controller). Isso centraliza o tratamento de erros globais.
*   **Desacoplamento:** Frontend e Backend são totalmente independentes e se comunicam apenas via APIs RESTful *Stateless*.
*   **Banco de Dados:** Utiliza **AWS RDS MySQL** com consultas via pacote `pymysql`. Toda a lógica complexa de rateio de compras parceladas ao longo dos meses é resolvida de forma eficiente no próprio SQL.

---

## 4. Segurança da Informação (Modelo STRIDE)
A segurança foi estruturada baseada no mapeamento de ameaças STRIDE da Microsoft.

*   **Spoofing (Falsificação):** Mitigado pelo login Passwordless do Telegram. O sistema usa *Tokens de Sessão Opacos* (UUIDv4), que são conferidos no banco a cada requisição (`validar_sessao`).
*   **Tampering (Adulteração):** Prevenção **total** contra **SQL Injection**. Toda a comunicação com o banco usa *Parameterized Queries*, onde as variáveis são sanitizadas pelo driver, sem concatenação de strings.
*   **Repudiation (Repúdio):** Logs imutáveis via AWS CloudWatch. Ações vinculadas a IDs únicos de usuário.
*   **Information Disclosure (Vazamento):**
    *   Erros 500 globais não expõem *Stack Traces* (Tracebacks) para o cliente.
    *   Dados enviados para a IA sofrem sanitização prévia com *Regex* (`sanitizar_frase()`) para evitar ataques de *Prompt Injection*.
*   **Denial of Service (DoS):** Além do auto-scaling da AWS, rotas de upload pesadas (ex: Faturas CSV) possuem um hard-limit de processamento de `1MB` para não estourar a memória.
*   **Elevation of Privilege (Elevação de Privilégios / IDOR):** O sistema previne a falha *Insecure Direct Object Reference*. Todas as rotas de alteração e exclusão checam explicitamente se a transação pertence ao dono do token (`AND user_id = %s`).

---

## 5. Bateria de 30 Perguntas para a Banca

### Arquitetura e Cloud (Serverless)
1. Por que escolheram AWS Lambda (Serverless) em vez de levantar uma VPS com um container Docker e uma API REST em Flask/NodeJS?
2. Quais são as limitações de usar um modelo Serverless? (Ex: Cold Starts).
3. Como o Frontend (React Native) e o Backend se comunicam? Eles estão acoplados ou são microsserviços separados?
4. Como funciona o ponto de entrada único do código no `v12.py` (`lambda_handler`) e quais as vantagens desse padrão de roteamento?

### Segurança e STRIDE (Foco principal)
5. Como vocês aplicaram a mitigação da ameaça "Tampering" (Adulteração) nas chamadas de banco de dados?
6. Explique o que é uma vulnerabilidade IDOR (Insecure Direct Object Reference) e como o backend do Zentrix evita que um usuário delete os dados de outro.
7. Onde entra a criptografia HMAC-SHA256 no sistema de login do Telegram? Por que ela garante que a requisição não foi forjada?
8. Por que decidiram não armazenar senhas (hashes bcrypt) na tabela de usuários e adotar um modelo *Passwordless*?
9. Como a função de `validar_sessao` no backend confere se a requisição do React Native é legítima?
10. O que é "Prompt Injection"? Como vocês protegem a API do Google Gemini de receber dados maliciosos através da frase do usuário?
11. Se ocorrer um Erro 500 no backend (ex: banco de dados caiu), como o servidor protege suas informações (Traceback/Versões de SO) de vazarem para o cliente?
12. Explique a defesa implementada no backend contra ataques de *Denial of Service* (Negação de Serviço) na rota de upload de CSV da fatura.
13. Como vocês validam se os *webhooks* recebidos silenciosamente no servidor vêm realmente do servidor do Telegram e não de um atacante?

### Banco de Dados
14. Por que escolheram um banco de dados relacional (MySQL) ao invés de um banco NoSQL (como o MongoDB), considerando que a IA devolve JSON?
15. Como o banco de dados e a query SQL lidam com o cálculo de gastos de uma compra parcelada feita meses atrás?
16. Na modelagem do banco de dados, qual a relação (cardinalidade) entre a entidade Usuário e Transação?

### Inteligência Artificial
17. O Zentrix tem um modelo de IA próprio treinado por vocês ou consome uma API externa?
18. Como é garantido que a resposta do Google Gemini venha sempre em um formato estruturado que o Python entenda, e não como um texto genérico?
19. O processamento de arquivo CSV da fatura usa alguma biblioteca de Machine Learning local ou repassa para o LLM? Por que dessa escolha?
20. Na função `obter_resumo_usuario()`, como é montado o prompt que gera os "insights financeiros" personalizados do mês?

### Frontend / React Native
21. Por que escolher React Native com o framework Expo e não desenvolver em Kotlin (Android) e Swift (iOS) nativamente?
22. Vocês usaram Redux para gerenciar o estado global da aplicação? Por que tomaram essa decisão?
23. Como o aplicativo Mobile guarda o Token de Autenticação para que ele não suma quando o usuário fechar o app, e de forma que seja segura contra outros apps no celular?
24. O processamento pesado de cálculos financeiros está no frontend ou no backend? Por quê?

### Produto e Visão Geral
25. Qual foi a principal dificuldade técnica ao tentar integrar a Autenticação do Telegram dentro do React Native?
26. Que problema de mercado o Zentrix resolve que aplicativos como o "Mobills" ou "Organizze" não resolvem tão bem?
27. Se o projeto escalasse hoje para 10.000 usuários simultâneos fazendo upload de faturas, qual a primeira peça da infraestrutura que poderia cair ou custar muito caro?
28. Como o projeto lida com fusos horários e datas de transações, já que os servidores da nuvem geralmente rodam em UTC?
29. A comunicação na API de vocês segue puramente o modelo REST ou possui adaptações?
30. Quais seriam os próximos passos e features para uma Versão 2.0 do Zentrix?
