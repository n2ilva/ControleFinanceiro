# 💰 Controle Financeiro

Uma aplicação React Native moderna e elegante para controle financeiro pessoal, com foco em gestão de despesas recorrentes e análise de gastos.

## ✨ Funcionalidades

### 📊 Gestão de Transações

- ✅ Adicionar receitas e despesas
- ✅ Marcar transações como pagas/não pagas
- ✅ Categorização automática com cores visuais
- ✅ Suporte a transações recorrentes
- ✅ Navegação entre meses
- ✅ Exclusão de transações

### 🔄 Transações Recorrentes

- Despesas recorrentes (água, energia, internet, etc.) são automaticamente duplicadas para o próximo mês
- Facilita o planejamento financeiro mensal
- Previsão de gastos futuros baseada em recorrências

### 📈 Análises e Gráficos

- **Gráfico de Tendência**: Visualize receitas e despesas dos últimos 6 meses
- **Gráfico de Pizza**: Distribuição de gastos por categoria
- **Previsão do Próximo Mês**: Baseada em despesas recorrentes
- **Detalhamento por Categoria**: Valores e percentuais de cada categoria

### 🎨 Categorias Disponíveis

- 💧 Água
- ⚡ Energia
- 📡 Internet
- 🍔 Alimentação
- 🚗 Transporte
- 🏥 Saúde
- 📚 Educação
- 🎮 Lazer
- 📦 Outros

## 🚀 Como Executar

### Pré-requisitos

- Node.js instalado
- Expo CLI
- Expo Go app no seu dispositivo móvel (opcional)

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd ControleFinanceiro
```

2. Instale as dependências:
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```
Edite o arquivo `.env` e adicione suas credenciais do Firebase.

4. Iniciar o servidor de desenvolvimento:

```bash
npm start
```

3. Executar em diferentes plataformas:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Build para produção (GitHub Pages)
npm run build:web
```

## 🔒 Segurança

Este projeto implementa diversas camadas de segurança:

- 🔐 Variáveis de ambiente para credenciais sensíveis
- 🛡️ Regras de segurança do Firebase (Firestore Rules)
- 🚨 Proteção contra self-XSS no console
- 🔑 Autenticação Firebase

**Leia o arquivo [SECURITY.md](SECURITY.md) para mais detalhes sobre configuração de segurança.**

## 🌐 Deploy

### GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages via GitHub Actions:

1. No GitHub, abra **Settings > Pages**
2. Em **Build and deployment**, selecione **Source: GitHub Actions**
3. Faça push na branch `main`
4. Acesse: `https://seuusuario.github.io/controlefinanceiro`

## 🎨 Design

A aplicação utiliza um **tema dark moderno** com:

- Paleta de cores vibrantes e harmoniosas
- Gradientes suaves
- Sombras e elevações para profundidade
- Micro-animações para melhor UX
- Design responsivo e intuitivo

### Cores Principais

- **Primary**: Índigo (#6366F1)
- **Success**: Verde (#10B981)
- **Danger**: Vermelho (#EF4444)
- **Background**: Slate escuro (#0F172A)

## 📱 Estrutura do Projeto

```
src/
├── navigation/        # Configuração de navegação
├── screens/          # Telas da aplicação
│   ├── HomeScreen.tsx           # Lista de transações
│   ├── AddTransactionScreen.tsx # Adicionar transação
│   └── ChartsScreen.tsx         # Gráficos e análises
├── services/         # Serviços (storage, etc)
├── types/           # Definições TypeScript
└── theme/           # Sistema de design
```

## 💾 Armazenamento

Os dados são armazenados no **Firebase Firestore**, garantindo:

- ☁️ Sincronização em tempo real
- 🔐 Autenticação segura
- 📱 Acesso multi-dispositivo
- 🔄 Backup automático na nuvem

## 📡 API REST — Analytics

O projeto inclui uma **API REST** na pasta `api/` que expõe dados analíticos completos dos usuários do app, conectando diretamente ao Firebase via Admin SDK.

### 🚀 Setup da API

1. **Obter credenciais do Firebase Admin SDK:**
   - Acesse o [Firebase Console](https://console.firebase.google.com/) → seu projeto
   - Vá em **⚙️ Configurações do projeto** → **Contas de serviço**
   - Clique em **"Gerar nova chave privada"**
   - Salve o arquivo como `api/serviceAccountKey.json`

2. **Instalar e rodar:**
```bash
cd api
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000`

### 🔐 Autenticação

Todas as rotas `/api/analytics/*` podem ser protegidas por API Key.

Para ativar, crie `api/.env` com:
```env
PORT=3000
API_KEY=sua-chave-secreta-aqui
```

Envie a chave no header das requisições:
```
x-api-key: sua-chave-secreta-aqui
```

> Sem `API_KEY` configurada, a API roda em modo aberto (dev).

### 📋 Endpoints Disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check (sem autenticação) |
| `GET` | `/api/analytics` | **Dashboard geral** — visão completa agregada |
| `GET` | `/api/analytics/users` | Métricas individuais por usuário |
| `GET` | `/api/analytics/transactions` | Transações (paginadas, filtráveis) |
| `GET` | `/api/analytics/credit-cards` | Cartões de crédito com uso e % do limite |
| `GET` | `/api/analytics/salaries` | Salários cadastrados |
| `GET` | `/api/analytics/goals` | Metas financeiras com progresso |
| `GET` | `/api/analytics/budgets` | Orçamentos por categoria |
| `GET` | `/api/analytics/groups` | Grupos e membros |

### 📊 Dashboard Geral (`GET /api/analytics`)

Retorna análise completa com:
- **Resumo geral** — total de usuários, transações, receita/despesa bruta, saldo global, recorrentes, parcelamentos
- **Médias por usuário** — receita, despesa, saldo, salário, saldo mensal
- **Categorias** — todas listadas, top 10 mais usadas, top 10 maior valor (receita e despesa)
- **Rankings** — receitas e despesas mais adicionadas (frequência), despesas mais caras (valor)
- **Tags** — total distintas, mais usadas
- **Cartões de crédito** — limite total, gasto total, detalhes por cartão com % do limite
- **Salários** — ativos vs inativos, soma, tipos
- **Orçamentos** — total criados, categorias com soma de limites
- **Metas** — total, concluídas, taxa de conclusão, progresso geral
- **Grupos** — total, membros, média de membros por grupo
- **Evolução mensal** — receita, despesa e saldo por mês

### 🔎 Filtros de Transações (`GET /api/analytics/transactions`)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `type` | string | `income` ou `expense` |
| `category` | string | Filtrar por categoria |
| `limit` | number | Quantidade por página (padrão: 100) |
| `offset` | number | Pular N resultados (padrão: 0) |

**Exemplo:**
```
GET /api/analytics/transactions?type=expense&category=alimentacao&limit=50&offset=0
```

### 💡 Exemplo de Resposta (`/api/analytics`)

```json
{
  "geradoEm": "2026-04-01T11:43:16.174Z",
  "resumoGeral": {
    "totalUsuarios": 5,
    "totalTransacoes": 678,
    "totalReceitaBruta": 298017.37,
    "totalDespesaBruta": 134222.43,
    "saldoGlobal": 163794.94,
    "totalTransacoesRecorrentes": 376,
    "totalParcelamentos": 36
  },
  "mediasPorUsuario": {
    "mediaReceitaPorUsuario": 59603.47,
    "mediaDespesaPorUsuario": 26844.49,
    "mediaSaldoFinalPorUsuario": 32758.98
  },
  "categorias": { "..." },
  "rankings": { "..." },
  "cartoesDeCredito": { "..." },
  "evolucaoMensal": [ "..." ]
}
```

### 📦 Scripts da API

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia a versão compilada (produção) |

### 🌐 Deploy da API

Para deploy em produção (Railway, Render, Google Cloud Run, etc.):

1. Configure `GOOGLE_APPLICATION_CREDENTIALS` com o caminho do JSON de service account
2. Configure `API_KEY` com uma chave forte
3. Execute `npm run build && npm start`

---

## 🔮 Funcionalidades Futuras

- [ ] Exportação de relatórios em PDF
- [x] ~~Backup na nuvem~~ (Firebase Firestore)
- [ ] Múltiplas contas/carteiras
- [x] ~~Metas de economia~~ (implementado)
- [ ] Notificações de vencimento
- [x] ~~Sincronização entre dispositivos~~ (Firebase)
- [x] ~~API REST para análise de dados~~ (implementado)

## 📄 Licença

Este projeto foi criado para fins educacionais e de demonstração.

---

Desenvolvido com ❤️ usando React Native + Expo
