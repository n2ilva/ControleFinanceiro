# ✅ Checklist de Configuração Firebase

## Status Atual

✅ **google-services.json** adicionado  
✅ **app.json** configurado  
✅ **firebase.ts** com credenciais corretas

## 🔥 Próximos Passos no Firebase Console

Acesse: https://console.firebase.google.com/project/controle-financeiro-6ba4b

### 1. ✅ Ativar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"** (se ainda não ativou)
3. Na aba **"Sign-in method"**, ative:
   - ✅ **E-mail/senha** → Clique em "Ativar" → Salvar

### 2. ✅ Criar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Localização: **southamerica-east1** (São Paulo)
5. Clique em **"Ativar"**

### 3. ✅ Configurar Regras de Segurança

No Firestore, vá em **"Regras"** e cole:

```javascript
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

### 4. ✅ Adicionar App Web (Opcional para Web)

Se quiser usar no navegador também:

1. No painel do projeto, clique no ícone **Web** (`</>`)
2. Nome: `Controle Financeiro Web`
3. Copie as credenciais (já estão configuradas!)

## 🧪 Testar a Aplicação

### Passo 1: Reiniciar o Servidor

```bash
# Pare o servidor atual (Ctrl+C)
npm start
```

### Passo 2: Testar no Expo Go

1. Escaneie o QR Code
2. Você verá a **tela de Login**
3. Toque em **"Criar conta"**
4. Preencha:
   - Nome: Seu nome
   - E-mail: seu@email.com
   - Senha: mínimo 6 caracteres
5. Toque em **"Criar Conta"**

### Passo 3: Verificar no Firebase Console

1. Vá em **Authentication** → **Users**
2. Você deve ver o usuário criado!

### Passo 4: Adicionar Transação

1. Após login, adicione uma transação
2. Vá em **Firestore Database** → **transactions**
3. Você deve ver a transação salva!

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/...)"

**Solução**: Verifique se Authentication está ativado no Console

### Erro: "Missing or insufficient permissions"

**Solução**: Verifique as regras de segurança do Firestore

### Erro: "Network request failed"

**Solução**: Verifique sua conexão com internet

### App não carrega

**Solução**:

1. Limpe o cache: `npm start -- --clear`
2. Recarregue o app no Expo Go

## 📱 Informações do Projeto

| Campo              | Valor                                   |
| ------------------ | --------------------------------------- |
| **Project ID**     | controle-financeiro-6ba4b               |
| **Package Name**   | com.n2ilva.controlefinanceiro           |
| **API Key**        | AIzaSyA1Ki7azHJIWYe_XSnhuZg4Q11QX9cL640 |
| **Project Number** | 1016960353822                           |

## 🎯 Próximos Passos

Depois de testar:

1. ✅ Adicionar botão de Logout
2. ✅ Testar em múltiplos dispositivos
3. ✅ Adicionar recuperação de senha
4. ✅ Implementar Google Sign-In (opcional)

---

**Tudo pronto para começar!** 🚀

Agora é só testar a aplicação e começar a usar o Firebase!
