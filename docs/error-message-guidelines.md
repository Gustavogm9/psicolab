# Guia de Estilo: Mensagens de Erro e Sucesso

Este documento define os padrões para mensagens de erro e sucesso no sistema, garantindo uma experiência consistente e amigável para o usuário.

---

## 📋 Princípios Fundamentais

### 1. **Clareza**
- Use linguagem simples e direta
- Evite jargões técnicos (RLS, PGRST, JWT, etc.)
- Seja específico sobre o que aconteceu

### 2. **Ação**
- Sempre indique o que o usuário pode fazer
- Forneça próximos passos concretos
- Evite mensagens que não sugerem solução

### 3. **Tom Humano**
- Seja empático e amigável
- Evite culpar o usuário ("você errou", "dados incorretos")
- Use linguagem positiva quando possível

### 4. **Consistência**
- Mantenha o mesmo padrão em todo o sistema
- Use a mesma terminologia para ações similares
- Estruture mensagens de forma previsível

---

## ✅ Mensagens de Sucesso

### Estrutura
```typescript
{
  title: "[Entidade] [ação no particípio]",
  description: "[Descrição confirmando a ação]"
}
```

### Exemplos BONS ✓
```typescript
// Criação
{
  title: "Cliente criado",
  description: "O cliente foi criado com sucesso."
}

// Atualização
{
  title: "Oportunidade atualizada",
  description: "A oportunidade foi atualizada com sucesso."
}

// Exclusão
{
  title: "Evento excluído",
  description: "O evento foi removido permanentemente."
}
```

### Exemplos RUINS ✗
```typescript
// ✗ Muito técnico
{
  title: "Success",
  description: "Record inserted into database table with ID 123"
}

// ✗ Muito verboso
{
  title: "Operação bem-sucedida",
  description: "A operação que você solicitou de criação do novo registro de cliente na base de dados foi executada com sucesso e você já pode visualizar..."
}

// ✗ Falta de contexto
{
  title: "Sucesso",
  description: "Operação concluída"
}
```

---

## ❌ Mensagens de Erro

### Estrutura
```typescript
{
  title: "Erro ao [ação] [entidade]",
  description: "[O que aconteceu] + [O que fazer]"
}
```

### Templates por Categoria

#### 1. Erros de Autenticação
```typescript
{
  title: "Sessão expirada",
  description: "Sua sessão expirou. Por favor, faça login novamente."
}
```

#### 2. Erros de Permissão
```typescript
{
  title: "Acesso negado",
  description: "Você não tem permissão para realizar esta ação. Verifique com o administrador."
}
```

#### 3. Erros de Duplicação
```typescript
{
  title: "Registro já existe",
  description: "Já existe um lead com este e-mail. Verifique a lista de leads ou atualize o registro existente."
}
```

#### 4. Erros de Validação
```typescript
{
  title: "Dados inválidos",
  description: "E-mail inválido. Verifique o formato (exemplo@dominio.com)."
}

{
  title: "Campos obrigatórios",
  description: "Preencha todos os campos obrigatórios antes de continuar."
}
```

#### 5. Erros de Rede
```typescript
{
  title: "Erro de conexão",
  description: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
}
```

#### 6. Erros de Dependência
```typescript
{
  title: "Não é possível excluir",
  description: "Este cliente possui avaliações vinculadas. Remova as avaliações primeiro ou arquive o cliente."
}
```

#### 7. Erros Genéricos
```typescript
{
  title: "Erro ao criar cliente",
  description: "Não foi possível criar o cliente. Verifique os dados e tente novamente."
}
```

---

## 🎯 Uso do Helper Centralizado

### Implementação Básica
```typescript
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';

export const useClienteMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      // ... lógica
    },
    onSuccess: () => {
      const message = getSuccessMessage({
        action: 'criar',
        entity: 'cliente',
        gender: 'o'
      });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar cliente',
        description: getUserFriendlyError(error, {
          action: 'criar',
          entity: 'cliente'
        }),
        variant: 'destructive',
      });
    },
  });
};
```

### Com Contexto Específico
```typescript
onError: (error: any) => {
  toast({
    title: 'Erro ao atualizar contato',
    description: getUserFriendlyError(error, {
      action: 'atualizar',
      entity: 'contato',
      field: 'email' // contexto adicional
    }),
    variant: 'destructive',
  });
}
```

---

## 📝 Checklist de Revisão

Antes de criar/modificar uma mensagem, verifique:

- [ ] A mensagem está em português claro?
- [ ] Evitei códigos técnicos (PGRST, RLS, 23505)?
- [ ] Indiquei o que o usuário deve fazer?
- [ ] O tom é amigável e não culpa o usuário?
- [ ] A mensagem é consistente com outras similares?
- [ ] Testei a mensagem em diferentes cenários?

---

## 🚫 Palavras/Frases a Evitar

❌ **Evite:**
- "Erro desconhecido"
- "Falha na requisição"
- "Código de erro: XXXXX"
- "RLS policy violation"
- "Você errou"
- "Dados inválidos" (sem especificar quais)
- "Tente novamente" (sem explicar o problema)

✅ **Prefira:**
- "Não foi possível completar a ação"
- "Verifique [campo específico]"
- Explicações específicas do problema
- Sugestões de próximos passos
- "Verifique os dados e tente novamente"

---

## 🔄 Processo de Atualização

Quando atualizar mensagens em hooks existentes:

1. **Identifique** o hook que precisa de melhoria
2. **Importe** o helper: `import { getUserFriendlyError } from '@/lib/error-messages'`
3. **Substitua** a mensagem no `onError`
4. **Teste** todos os cenários de erro possíveis
5. **Documente** se houver casos especiais

---

## 📚 Exemplos Completos

### Antes (❌)
```typescript
onError: (error: any) => {
  toast({
    title: 'Erro ao criar lead',
    description: error.message, // "PGRST301: new row violates RLS"
    variant: 'destructive',
  });
}
```

### Depois (✅)
```typescript
onError: (error: any) => {
  toast({
    title: 'Erro ao criar lead',
    description: getUserFriendlyError(error, {
      action: 'criar',
      entity: 'lead'
    }), // "Você não tem permissão para criar leads. Verifique com o administrador."
    variant: 'destructive',
  });
}
```

---

## 🎓 Referências

- [Nielsen Norman Group - Error Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [Material Design - Error Messages](https://material.io/design/communication/confirmation-acknowledgement.html)
- Documentação interna: `src/lib/error-messages.ts`

---

**Última atualização:** 2024-01-20  
**Versão:** 1.0  
**Mantenedor:** Equipe de Desenvolvimento
