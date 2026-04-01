# 📊 API REST — Controle Financeiro Analytics

API REST que conecta ao Firebase (Firestore) e disponibiliza dados analíticos completos dos usuários do app Controle Financeiro.

## 🚀 Setup Rápido

### 1. Obter credenciais do Firebase Admin SDK

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Configurações do projeto** → **Contas de serviço**
3. Clique em **Gerar nova chave privada**
4. Salve o arquivo como `serviceAccountKey.json` na pasta `api/`

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```env
PORT=3000
API_KEY=sua-chave-secreta-aqui
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### 3. Instalar dependências e rodar

```bash
cd api
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000`

---

## 🔐 Autenticação

Todas as rotas `/api/analytics/*` são protegidas por API Key.

Envie a chave no header:
```
x-api-key: sua-chave-secreta-aqui
```

> Se a variável `API_KEY` não estiver configurada no `.env`, a API roda em modo aberto (dev).

---

## 📡 Endpoints

### Health Check
```
GET /health
```
Retorna status da API (sem autenticação).

---

### Dashboard Geral
```
GET /api/analytics
```
Retorna análise completa agregada com:
- Resumo geral (total de usuários, transações, receita/despesa bruta, saldo global)
- Médias por usuário (receita, despesa, saldo, salário)
- Categorias (mais usadas, maiores valores por receita e despesa)
- Rankings (receitas e despesas mais adicionadas e mais caras)
- Tags mais utilizadas
- Cartões de crédito (limites, uso, % do limite)
- Salários (ativos, inativos, tipos)
- Orçamentos (categorias, limites)
- Metas financeiras (total, concluídas, progresso geral)
- Grupos (total, membros)
- Evolução mensal (receita, despesa, saldo por mês)

---

### Usuários com Métricas
```
GET /api/analytics/users
```
Lista todos os usuários com métricas individuais:
- Total de transações, receita, despesa e saldo
- Categorias usadas
- Salário ativo total
- Cartões (quantidade, limite, gasto)
- Metas (total, concluídas)

---

### Transações
```
GET /api/analytics/transactions?type=expense&category=alimentação&limit=100&offset=0
```
Lista transações com paginação e filtros opcionais.

| Parâmetro  | Tipo   | Descrição                        |
|------------|--------|----------------------------------|
| `type`     | string | `income` ou `expense`            |
| `category` | string | Filtrar por categoria            |
| `limit`    | number | Quantidade por página (padrão 100)|
| `offset`   | number | Pular N resultados (padrão 0)    |

---

### Cartões de Crédito
```
GET /api/analytics/credit-cards
```
Todos os cartões com detalhes de uso, limite e percentual utilizado.

---

### Salários
```
GET /api/analytics/salaries
```
Todos os salários cadastrados com status ativo/inativo.

---

### Metas Financeiras
```
GET /api/analytics/goals
```
Todas as metas com progresso percentual.

---

### Orçamentos
```
GET /api/analytics/budgets
```
Todos os orçamentos por categoria, mês e ano.

---

### Grupos
```
GET /api/analytics/groups
```
Todos os grupos com membros.

---

## 🏗️ Estrutura do Projeto

```
api/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Conexão Firebase Admin SDK
│   ├── controllers/
│   │   └── analytics.controller.ts  # Lógica de todos os endpoints
│   ├── middleware/
│   │   └── auth.ts              # Middleware de API Key
│   ├── routes/
│   │   └── analytics.routes.ts  # Definição das rotas
│   └── index.ts                 # Entry point do servidor
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 📦 Scripts

| Comando         | Descrição                            |
|-----------------|--------------------------------------|
| `npm run dev`   | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript para JavaScript   |
| `npm start`     | Inicia a versão compilada (produção) |

## 🌐 Deploy

Para deploy em produção (ex: Railway, Render, Google Cloud Run):

1. Configure a variável `GOOGLE_APPLICATION_CREDENTIALS` com o conteúdo do JSON (ou monte o arquivo)
2. Configure `API_KEY` com uma chave forte
3. Configure `PORT` se necessário
4. Execute `npm run build && npm start`
