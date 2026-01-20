# 🔥 Guia de Configuração do Firebase

## 📋 Passo a Passo

### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `controle-financeiro` (ou o nome que preferir)
4. Aceite os termos e clique em **"Continuar"**
5. Desabilite o Google Analytics (opcional) e clique em **"Criar projeto"**

### 2. Adicionar App Web ao Projeto

1. No painel do projeto, clique no ícone **Web** (`</>`)
2. Nome do app: `Controle Financeiro App`
3. **NÃO** marque "Firebase Hosting"
4. Clique em **"Registrar app"**
5. **COPIE** as credenciais que aparecem (você vai precisar delas!)

### 3. Ativar Autenticação

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, ative:
   - ✅ **E-mail/senha**
   - ✅ **Google** (opcional, mas recomendado)

### 4. Criar Banco de Dados Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Escolha a localização: **southamerica-east1** (São Paulo)
5. Clique em **"Ativar"**

### 5. Configurar Regras de Segurança do Firestore

No Firestore, vá em **"Regras"** e substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Transações do usuário
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }

    // Salários do usuário
    match /salaries/{salaryId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

Clique em **"Publicar"**.

### 6. Atualizar Configuração no App

1. Abra o arquivo: `src/config/firebase.ts`
2. Substitua as credenciais placeholder pelas suas:

\`\`\`typescript
const firebaseConfig = {
apiKey: "AIza...", // Cole aqui
authDomain: "seu-projeto.firebaseapp.com",
projectId: "seu-projeto-id",
storageBucket: "seu-projeto.appspot.com",
messagingSenderId: "123456789",
appId: "1:123456789:web:..."
};
\`\`\`

### 7. Estrutura do Firestore

O app criará automaticamente estas coleções:

\`\`\`
firestore/
├── users/
│ └── {userId}/
│ ├── profile (documento)
│ └── settings (documento)
│
├── transactions/
│ └── {transactionId} (documentos)
│ ├── userId
│ ├── description
│ ├── amount
│ ├── category
│ ├── type
│ ├── isPaid
│ ├── isRecurring
│ ├── dueDate
│ └── createdAt
│
└── salaries/
└── {salaryId} (documentos)
├── userId
├── description
├── amount
├── isActive
└── createdAt
\`\`\`

## 🔐 Segurança

- ✅ Cada usuário só acessa seus próprios dados
- ✅ Autenticação obrigatória para todas as operações
- ✅ Regras de segurança configuradas no Firestore
- ✅ Dados criptografados em trânsito e em repouso

## 🚀 Funcionalidades com Firebase

### ✨ Vantagens

1. **Sincronização em Tempo Real**: Dados sincronizados entre dispositivos
2. **Backup Automático**: Seus dados estão seguros na nuvem
3. **Multi-dispositivo**: Acesse de qualquer lugar
4. **Autenticação Segura**: Login com e-mail ou Google
5. **Offline First**: Funciona mesmo sem internet (cache local)

### 📱 Como Usar

1. **Primeiro Acesso**: Criar conta com e-mail e senha
2. **Login**: Entrar com suas credenciais
3. **Dados Sincronizados**: Tudo que você adicionar será salvo na nuvem
4. **Logout**: Sair da conta quando quiser

## 🛠️ Comandos Úteis

### Testar Localmente

\`\`\`bash
npm start
\`\`\`

### Limpar Cache

\`\`\`bash
npm start -- --clear
\`\`\`

## 📞 Suporte

Se tiver problemas:

1. Verifique se as credenciais estão corretas
2. Confirme que Authentication e Firestore estão ativos
3. Verifique as regras de segurança
4. Veja o console do Firebase para logs de erro

## 🎯 Próximos Passos

Após configurar o Firebase:

1. ✅ Reinicie o app
2. ✅ Crie sua conta
3. ✅ Comece a usar!

Seus dados estarão sincronizados automaticamente! 🎉
