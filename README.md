# 💰 Controle Financeiro

Aplicação mobile e web completa para **controle financeiro pessoal e compartilhado**, desenvolvida com React Native + Expo e Firebase. Inclui uma API REST para análise de dados.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [API REST — Analytics](#-api-rest--analytics)
- [Segurança](#-segurança)
- [Deploy](#-deploy)
- [Licença](#-licença)

---

## ✨ Funcionalidades

### 📊 Gestão de Transações
- Adicionar receitas e despesas com categorias personalizáveis
- Transações recorrentes com geração automática mensal
- Parcelamentos com controle de parcelas (ex: 1/3, 2/3, 3/3)
- Navegação entre meses com resumo financeiro
- Tags customizáveis para classificação extra
- Busca por descrição com fuzzy search

### 💳 Cartões de Crédito e Débito
- Cadastro com nome, cor, dia de vencimento e limite
- Acompanhamento de gastos por cartão vs limite
- Controle de pagamento de faturas mensais
- Suporte a cartões de crédito e débito

### 💵 Salários e Receitas
- Cadastro de múltiplos salários (CLT, freelance, bonus, 13º, férias)
- Ajuste mensal de valores (horas extras, descontos)
- Inclusão automática na receita do mês

### 🎯 Metas Financeiras
- Criar metas com valor alvo e prazo
- Acompanhar progresso com aportes parciais
- Indicador visual de progresso

### 📋 Orçamentos
- Definir limites mensais por categoria
- Copiar orçamentos de um mês para outro

### 👨‍👩‍👧‍👦 Grupos Compartilhados
- Criar ou entrar em grupos com código de convite
- Compartilhar transações, salários e cartões entre membros
- Alternar entre modo pessoal e modo grupo

### 📈 Gráficos e Análises
- Gráfico de tendência dos últimos 6 meses
- Distribuição de gastos por categoria (pizza)
- Previsão do próximo mês baseada em recorrências
- Detalhamento por categoria com valores e percentuais

### 🎨 Categorias
30+ categorias nativas com ícones e cores:

| | | | |
|---|---|---|---|
| 💧 Água | ⚡ Energia | 📡 Internet | 📞 Telefone |
| 🍔 Alimentação | 🛒 Mercado | ⛽ Combustível | 🚗 Transporte |
| 🏥 Saúde | 📚 Educação | 🎮 Lazer | 🏠 Moradia |
| 👕 Vestuário | 🐾 Pets | 💊 Farmácia | 🎁 Presentes |
| + Categorias customizáveis criadas pelo usuário |

---

## 🛠️ Stack Tecnológica

### App Mobile/Web
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React Native | 0.81 | Framework mobile |
| Expo | 54 | Plataforma de desenvolvimento |
| TypeScript | 5.9 | Tipagem estática |
| Firebase Auth | 12.8 | Autenticação |
| Firebase Firestore | 12.8 | Banco de dados |
| React Navigation | 7.x | Navegação entre telas |
| React Native Chart Kit | 6.12 | Gráficos e visualizações |
| AsyncStorage | 2.2 | Armazenamento local |

### API Analytics
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Express | 5.x | Framework HTTP |
| Firebase Admin SDK | 13.x | Acesso admin ao Firestore |
| TypeScript | 6.x | Tipagem |
| ts-node-dev | 2.x | Hot reload em dev |

---

## 📱 Estrutura do Projeto

```
ControleFinanceiro/
├── App.tsx                    # Entry point do app
├── app.json                   # Configuração Expo
├── firestore.rules            # Regras de segurança do Firestore
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── AddCardBottomSheet.tsx
│   │   └── PageHeader.tsx
│   ├── config/
│   │   ├── firebase.ts        # Conexão Firebase (client SDK)
│   │   ├── security.ts        # Proteção anti-XSS no console
│   │   └── webAutofill.ts     # Fix de estilos autofill web
│   ├── constants/
│   │   └── categories.ts      # 30+ categorias com ícones/cores
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Contexto de autenticação
│   │   └── ThemeContext.tsx    # Contexto de tema (dark/light)
│   ├── hooks/
│   │   └── useResponsive.ts   # Hook de responsividade web/mobile
│   ├── navigation/
│   │   └── index.tsx           # Navegação com tabs e stacks
│   ├── screens/               # 15 telas
│   │   ├── HomeScreen/        # Dashboard principal
│   │   ├── AddTransactionScreen/
│   │   ├── EditTransactionScreen/
│   │   ├── ChartsScreen/      # Gráficos e análises
│   │   ├── CreditCardsScreen/ # Gestão de cartões
│   │   ├── CardDetailsScreen/
│   │   ├── CardMonthDetailsScreen/
│   │   ├── SalariesScreen/    # Gestão de salários
│   │   ├── AddSalaryScreen/
│   │   ├── BudgetsScreen/     # Orçamentos
│   │   ├── GoalsScreen/       # Metas financeiras
│   │   ├── GroupScreen/       # Grupos compartilhados
│   │   ├── SettingsScreen/    # Configurações
│   │   ├── LoginScreen/
│   │   └── RegisterScreen/
│   ├── services/              # Camada de dados
│   │   ├── authService.ts     # Autenticação Firebase
│   │   ├── firestoreService.ts # Transações (25KB, serviço principal)
│   │   ├── creditCardFirestoreService.ts
│   │   ├── salaryFirestoreService.ts
│   │   ├── budgetService.ts
│   │   ├── goalService.ts
│   │   ├── groupService.ts
│   │   ├── customCategoryService.ts
│   │   ├── salaryService.ts
│   │   └── storage.ts         # AsyncStorage helpers
│   ├── theme/
│   │   └── index.ts           # Design tokens e cores
│   ├── types/
│   │   └── index.ts           # Interfaces TypeScript
│   └── utils/
│       ├── alert.ts           # Alertas cross-platform
│       ├── formatters.ts      # Formatação de moeda/data
│       └── fuzzySearch.ts     # Busca inteligente
│
├── api/                       # API REST Analytics
│   ├── src/
│   │   ├── config/firebase.ts         # Firebase Admin SDK
│   │   ├── controllers/analytics.controller.ts
│   │   ├── middleware/auth.ts         # API Key auth
│   │   ├── routes/analytics.routes.ts
│   │   └── index.ts                   # Servidor Express
│   ├── serviceAccountKey.json         # (não commitado)
│   ├── package.json
│   └── tsconfig.json
│
├── assets/                    # Ícones e splash screen
├── docs/                      # Build web para GitHub Pages
└── SECURITY.md                # Documentação de segurança
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go no dispositivo (opcional, para teste mobile)

### 1. Clone e instale

```bash
git clone https://github.com/n2ilva/ControleFinanceiro.git
cd ControleFinanceiro
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Firebase:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123
```

### 3. Execute

```bash
# Servidor de desenvolvimento
npm start

# Plataformas específicas
npm run android    # Android (Expo Go ou emulador)
npm run ios        # iOS (simulador, apenas macOS)
npm run web        # Web (navegador)

# Build web para produção
npm run build:web
```

---

## 📡 API REST — Analytics

O projeto inclui uma **API REST** na pasta `api/` que expõe dados analíticos completos dos usuários, conectando ao Firebase via Admin SDK.

### Setup da API

```bash
# 1. Obtenha o Service Account Key no Firebase Console:
#    ⚙️ Configurações > Contas de serviço > Gerar nova chave privada
#    Salve como: api/serviceAccountKey.json

# 2. Instale e rode
cd api
npm install
npm run dev
```

> A API roda em `http://localhost:3000`

### Autenticação

Proteja a API criando `api/.env`:
```env
PORT=3000
API_KEY=sua-chave-secreta
```

Envie o header nas requisições:
```
x-api-key: sua-chave-secreta
```

> Sem `API_KEY` configurada, a API roda em modo aberto (dev).

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check (sem auth) |
| `GET` | `/api/analytics` | Dashboard geral agregado |
| `GET` | `/api/analytics/users` | Métricas individuais por usuário |
| `GET` | `/api/analytics/transactions` | Transações (paginadas, filtráveis) |
| `GET` | `/api/analytics/credit-cards` | Cartões com uso e % do limite |
| `GET` | `/api/analytics/salaries` | Salários cadastrados |
| `GET` | `/api/analytics/goals` | Metas financeiras com progresso |
| `GET` | `/api/analytics/budgets` | Orçamentos por categoria |
| `GET` | `/api/analytics/groups` | Grupos e membros |

### Dashboard Geral (`GET /api/analytics`)

Retorna análise completa:
- **Resumo** — total de usuários, transações, receita/despesa bruta, saldo global
- **Médias por usuário** — receita, despesa, saldo, salário mensal
- **Categorias** — todas com valores, top 10 mais usadas, top 10 maiores valores
- **Rankings** — receitas/despesas mais frequentes e mais caras
- **Cartões** — limite total, gasto total, detalhes por cartão com %
- **Salários** — ativos, inativos, tipos
- **Orçamentos** — categorias com limites
- **Metas** — total, concluídas, progresso geral
- **Grupos** — total, membros
- **Evolução mensal** — gráfico de receita × despesa × saldo

### Filtros de Transações

```
GET /api/analytics/transactions?type=expense&category=alimentacao&limit=50&offset=0
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `type` | string | `income` ou `expense` |
| `category` | string | Nome da categoria |
| `limit` | number | Itens por página (padrão: 100) |
| `offset` | number | Pular N resultados (padrão: 0) |

### Exemplo de Resposta

```json
{
  "geradoEm": "2026-04-01T11:43:16.174Z",
  "resumoGeral": {
    "totalUsuarios": 5,
    "totalTransacoes": 678,
    "totalReceitaBruta": 298017.37,
    "totalDespesaBruta": 134222.43,
    "saldoGlobal": 163794.94
  },
  "mediasPorUsuario": {
    "mediaReceitaPorUsuario": 59603.47,
    "mediaDespesaPorUsuario": 26844.49,
    "mediaSaldoFinalPorUsuario": 32758.98
  }
}
```

### Scripts da API

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev com hot reload |
| `npm run build` | Compila para JS |
| `npm start` | Produção (JS compilado) |

---

## 🔒 Segurança

### Camadas de Proteção

| Camada | Descrição |
|--------|-----------|
| 🔑 Firebase Auth | Login com email/senha, mensagens de erro traduzidas |
| 🛡️ Firestore Rules | Isolamento por usuário + acesso por grupo (ver `firestore.rules`) |
| 🔐 Variáveis de ambiente | `.env` não commitado, fallback via `app.json` |
| 🚨 Anti Self-XSS | Proteção do console em produção |
| 🔒 API Key | Middleware de auth na API REST |
| 📋 Service Account | `serviceAccountKey.json` no `.gitignore` |

### Firestore Rules

As regras garantem:
- **Dados pessoais**: cada usuário acessa apenas seus documentos
- **Dados de grupo**: membros do grupo compartilham transações, salários e cartões
- **Grupos**: apenas membros leem, apenas admin deleta
- **Perfil**: cada usuário edita apenas seu próprio perfil
- **Regra padrão**: tudo é negado por padrão (deny-all)

> Para mais detalhes, veja [SECURITY.md](SECURITY.md) e [firestore.rules](firestore.rules).

---

## 🌐 Deploy

### App Web — GitHub Pages

1. No GitHub, abra **Settings > Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Faça push na branch `main`
4. Acesse: `https://n2ilva.github.io/ControleFinanceiro`

### App Mobile — EAS Build

```bash
npx eas build --platform android --profile preview
```

### API REST — Produção

Para deploy em Railway, Render, Google Cloud Run, etc.:

```bash
cd api
npm run build
npm start
```

Configure as variáveis de ambiente:
- `GOOGLE_APPLICATION_CREDENTIALS` — caminho do service account JSON
- `API_KEY` — chave de acesso à API
- `PORT` — porta do servidor (padrão: 3000)

---

## 🎨 Design

Tema **dark moderno** com:
- Paleta baseada em Índigo (#6366F1) com tons de Slate
- Gradientes suaves e sombras para profundidade
- Micro-animações para melhor UX
- Layout responsivo (mobile + web)
- Suporte a tema claro/escuro

---

## 📄 Licença

Este projeto foi criado para fins educacionais e de uso pessoal.

---

Desenvolvido com ❤️ usando React Native + Expo + Firebase
