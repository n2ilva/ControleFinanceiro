# 🔒 Segurança do Projeto

## Variáveis de Ambiente

Este projeto usa variáveis de ambiente para proteger informações sensíveis do Firebase.

### Configuração Inicial

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha o arquivo `.env` com suas credenciais do Firebase Console

3. **NUNCA** faça commit do arquivo `.env` - ele já está no `.gitignore`

## ⚠️ Importante

**Limitações de Segurança em Apps Client-Side:**

Mesmo usando variáveis de ambiente, em aplicações web/mobile as chaves do Firebase **SEMPRE** estarão visíveis no código compilado do navegador. Isso é uma característica de aplicações client-side.

### Verdadeira Segurança no Firebase

A segurança real vem das **Regras do Firebase**:

#### 1. Firestore Security Rules
Configure regras no Firebase Console em **Firestore Database > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Usuários só podem acessar seus próprios dados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

#### 2. Firebase Authentication
- Habilite apenas os métodos de autenticação necessários
- Configure domínios autorizados
- Use Email Enumeration Protection

#### 3. API Key Restrictions (Opcional para produção)
No Google Cloud Console:
- Restrinja a API Key por domínio (ex: `seusite.github.io`)
- Restrinja por aplicativo (bundle ID/package name)

## Domínios Autorizados

Adicione estes domínios no Firebase Console → Authentication → Settings → Authorized domains:
- `localhost` (desenvolvimento)
- `seuusuario.github.io` (produção)

## Checklist de Segurança

- [x] Arquivo `.env` criado e não commitado
- [x] Variáveis de ambiente configuradas
- [ ] Regras de segurança do Firestore configuradas (ver `firestore.rules`)
- [ ] Domínios autorizados no Firebase Auth
- [ ] API Key com restrições (opcional para produção)

## Como Aplicar as Regras de Segurança

### 1. Via Firebase Console (Recomendado)
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `controle-financeiro-6ba4b`
3. Vá em **Firestore Database** → **Rules**
4. Copie o conteúdo do arquivo `firestore.rules` deste repositório
5. Cole no editor e clique em **Publish**

### 2. Via Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Proteções Implementadas

### ✅ Proteção de Variáveis de Ambiente
- Arquivo `.env` não é commitado no git
- Template `.env.example` disponível para novos desenvolvedores
- Validação de variáveis ao iniciar a aplicação

### ✅ Proteção do Console
- Mensagens de aviso contra self-XSS
- Console desabilitado em produção
- Detector de DevTools (opcional)

### ✅ Regras de Firestore
- Usuários só acessam seus próprios dados
- Validação de autenticação em todas as operações
- Controle de permissões para grupos compartilhados

