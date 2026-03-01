# 📋 Regras de Permissão do Firestore

## Como as Permissões Funcionam

### 🔐 Dados Pessoais

Quando você cria uma transação, salário ou cartão **SEM vincular a um grupo**, apenas você pode:
- ✅ Visualizar
- ✅ Editar
- ✅ Excluir

### 👥 Dados Compartilhados em Grupos

Quando você vincula uma transação, salário ou cartão a um **grupo**, TODOS os membros do grupo podem:
- ✅ Visualizar os dados
- ✅ Editar os dados
- ✅ Excluir os dados

### Exemplo Prático

**Cenário 1: Dados Pessoais**
```javascript
{
  userId: "maria123",
  description: "Salário Maria",
  amount: 5000,
  // Sem groupId - Apenas Maria pode acessar
}
```

**Cenário 2: Dados Compartilhados**
```javascript
{
  userId: "maria123",
  groupId: "familia_silva",
  description: "Conta de Energia",
  amount: 200,
  // Com groupId - Todos do grupo "familia_silva" podem acessar
}
```

## 📊 Recursos Compartilháveis

### Podem ser compartilhados em grupos:
- 💰 **Transações** (receitas e despesas)
- 💵 **Salários**
- 💳 **Cartões de Crédito**

### Exclusivos do grupo:
- 👥 **Membros do Grupo**
  - Qualquer membro pode ver todos os membros
  - Apenas o admin pode adicionar/remover membros

- ⚙️ **Configurações do Grupo**
  - Membros podem editar configurações
  - Apenas o admin pode excluir o grupo

## 🔒 Regras de Segurança

### Validações Automáticas:

1. **Autenticação obrigatória**: Usuário deve estar logado
2. **Verificação de propriedade**: Usuário é dono OU membro do grupo
3. **Isolamento de dados**: Grupos não podem acessar dados de outros grupos
4. **Validação de grupo**: Sistema verifica se o grupo existe antes de permitir acesso

### Código das Regras

As regras estão definidas no arquivo [firestore.rules](firestore.rules) e seguem este padrão:

```javascript
// Para cada recurso (transação, salário, cartão)
allow read: if autenticado 
            && (é_dono OU é_membro_do_grupo)

allow write/delete: if autenticado 
                    && (é_dono OU é_membro_do_grupo)

allow create: if autenticado 
              && (vai_ser_dono OU é_membro_do_grupo)
```

## 🚀 Como Implementar no Código

### Criando dados pessoais:
```javascript
await addDoc(collection(db, 'transactions'), {
  userId: auth.currentUser.uid,
  description: 'Minha despesa',
  amount: 100,
  // Sem groupId = pessoal
});
```

### Criando dados compartilhados:
```javascript
await addDoc(collection(db, 'transactions'), {
  userId: auth.currentUser.uid,
  groupId: grupoSelecionado.id, // <-- Com groupId = compartilhado
  description: 'Despesa da família',
  amount: 100,
});
```

## ⚠️ Importante

- **Campo groupId é opcional**: Se não informado, dados são pessoais
- **Campo groupId deve existir**: O grupo deve estar criado no Firestore
- **Todos do grupo têm acesso total**: Não há diferença entre admin e membro para acesso aos dados
- **Admin tem privilégios extras**: Apenas para gerenciar membros e excluir o grupo
