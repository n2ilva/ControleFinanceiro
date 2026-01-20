# 📁 Estrutura do Projeto

```
Controle-Financeiro/
│
├── 📱 App.tsx                          # Componente principal da aplicação
├── 📄 app.json                         # Configuração do Expo
├── 📦 package.json                     # Dependências do projeto
│
├── 📂 src/
│   │
│   ├── 🎨 theme/
│   │   └── index.ts                    # Sistema de design (cores, espaçamentos, tipografia)
│   │
│   ├── 📝 types/
│   │   └── index.ts                    # Definições TypeScript (Transaction, MonthlyData, etc.)
│   │
│   ├── 💾 services/
│   │   └── storage.ts                  # Serviço de armazenamento local (AsyncStorage)
│   │
│   ├── 🧭 navigation/
│   │   └── index.tsx                   # Configuração de navegação (Tabs + Stack)
│   │
│   └── 📱 screens/
│       ├── HomeScreen.tsx              # Tela principal com lista de transações
│       ├── AddTransactionScreen.tsx    # Tela para adicionar transações
│       └── ChartsScreen.tsx            # Tela de gráficos e análises
│
├── 📚 README.md                        # Documentação do projeto
├── 📖 GUIA_DE_USO.md                   # Guia de uso para o usuário
│
└── 📂 assets/                          # Ícones e imagens
    ├── icon.png
    ├── splash-icon.png
    ├── adaptive-icon.png
    └── favicon.png
```

## 🎯 Arquivos Principais

### App.tsx

Ponto de entrada da aplicação. Configura a navegação e o StatusBar.

### src/theme/index.ts

Sistema de design completo com:

- Paleta de cores (tema dark)
- Espaçamentos padronizados
- Tamanhos de fonte
- Pesos de fonte
- Sombras e elevações
- Cores específicas para cada categoria

### src/types/index.ts

Definições TypeScript para:

- `Transaction`: Estrutura de uma transação
- `MonthlyData`: Dados agregados de um mês
- `CategoryData`: Dados de categoria para gráficos

### src/services/storage.ts

Serviço de armazenamento que gerencia:

- Salvar/carregar transações
- Adicionar/atualizar/deletar transações
- Obter dados mensais agregados
- Duplicar transações recorrentes

### src/navigation/index.tsx

Configuração de navegação com:

- Bottom Tabs (Início e Análises)
- Stack Navigator para modais
- Estilização customizada

### src/screens/HomeScreen.tsx

Tela principal com:

- Card de saldo mensal
- Seletor de mês
- Lista de transações
- Ações (marcar como pago, excluir)
- FAB para adicionar transação

### src/screens/AddTransactionScreen.tsx

Formulário para adicionar transações com:

- Seletor de tipo (despesa/receita)
- Campos de descrição e valor
- Grid de categorias visuais
- Toggle para transação recorrente

### src/screens/ChartsScreen.tsx

Tela de análises com:

- Resumo mensal
- Gráfico de tendência (6 meses)
- Gráfico de pizza (distribuição por categoria)
- Detalhamento de categorias
- Previsão do próximo mês

## 🔧 Tecnologias Utilizadas

- **React Native**: Framework mobile
- **Expo**: Plataforma de desenvolvimento
- **TypeScript**: Tipagem estática
- **React Navigation**: Navegação entre telas
- **AsyncStorage**: Armazenamento local
- **react-native-chart-kit**: Gráficos
- **react-native-svg**: Suporte a SVG
- **Expo Vector Icons**: Ícones

## 📊 Fluxo de Dados

```
┌─────────────────┐
│   AsyncStorage  │  ← Persistência de dados
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ StorageService  │  ← Camada de serviço
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Screens      │  ← Interface do usuário
│  - Home         │
│  - AddTrans     │
│  - Charts       │
└─────────────────┘
```

## 🎨 Sistema de Cores

### Cores Principais

- **Primary**: #6366F1 (Índigo)
- **Success**: #10B981 (Verde)
- **Danger**: #EF4444 (Vermelho)
- **Warning**: #F59E0B (Laranja)

### Cores de Categorias

- **Água**: #3B82F6 (Azul)
- **Energia**: #FBBF24 (Amarelo)
- **Internet**: #8B5CF6 (Roxo)
- **Alimentação**: #10B981 (Verde)
- **Transporte**: #F97316 (Laranja)
- **Saúde**: #EC4899 (Rosa)
- **Educação**: #06B6D4 (Ciano)
- **Lazer**: #A855F7 (Roxo claro)
- **Outros**: #64748B (Cinza)

### Cores de Fundo

- **Background**: #0F172A (Slate escuro)
- **Background Card**: #1E293B (Slate médio)
- **Surface**: #334155 (Slate claro)

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- 📱 iOS
- 🤖 Android
- 🌐 Web (via Expo)

## 🔐 Armazenamento de Dados

Os dados são armazenados localmente usando AsyncStorage:

- Chave: `@financial_app_transactions`
- Formato: JSON array de transações
- Persistência: Dados mantidos entre sessões
- Privacidade: Dados ficam apenas no dispositivo
