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

## 🔮 Funcionalidades Futuras

- [ ] Exportação de relatórios em PDF
- [ ] Backup na nuvem
- [ ] Múltiplas contas/carteiras
- [ ] Metas de economia
- [ ] Notificações de vencimento
- [ ] Sincronização entre dispositivos

## 📄 Licença

Este projeto foi criado para fins educacionais e de demonstração.

---

Desenvolvido com ❤️ usando React Native + Expo
