/**
 * Helper centralizado para traduzir erros técnicos em mensagens amigáveis
 * 
 * @example
 * ```typescript
 * onError: (error: any) => {
 *   toast({
 *     title: 'Erro ao criar cliente',
 *     description: getUserFriendlyError(error, { action: 'criar', entity: 'cliente' }),
 *     variant: 'destructive',
 *   });
 * }
 * ```
 */

export interface ErrorContext {
  action?: 'criar' | 'atualizar' | 'deletar' | 'buscar' | 'enviar' | 'carregar' | 'exportar' | 'cancelar' | 'reenviar';
  entity?: 'cliente' | 'lead' | 'oportunidade' | 'evento' | 'intervenção' | 'avaliação' | 'contato' | 'categoria' | 'questionário' | 'depoimento' | 'relatório' | 'imagem' | 'membro' | 'convite' | 'serviço' | 'perfil' | 'interação';
  field?: string;
}

/**
 * Converte erros técnicos em mensagens amigáveis para o usuário
 */
export function getUserFriendlyError(error: any, context?: ErrorContext): string {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';

  // Log técnico para debug (mantém informação para desenvolvedores)
  console.error('Error details:', {
    message: error?.message,
    code: error?.code,
    hint: error?.hint,
    details: error?.details,
    context,
  });

  // 1. Erros de autenticação
  if (errorMessage.includes('not authenticated') || errorMessage.includes('jwt') || errorCode === '401') {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  // 2. Erros de permissão (RLS)
  if (
    errorMessage.includes('row-level security') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('new row violates') ||
    errorCode === 'pgrst301' ||
    errorCode === '42501'
  ) {
    return 'Você não tem permissão para realizar esta ação. Verifique com o administrador.';
  }

  // 3. Erros de duplicação
  if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorCode === '23505') {
    if (context?.entity === 'lead' && errorMessage.includes('email')) {
      return 'Já existe um lead com este e-mail. Verifique a lista de leads ou atualize o registro existente.';
    }
    if (context?.entity === 'cliente' && errorMessage.includes('email')) {
      return 'Já existe um cliente com este e-mail. Verifique a lista de clientes.';
    }
    if (context?.entity === 'categoria' && errorMessage.includes('nome')) {
      return 'Já existe uma categoria com este nome. Escolha outro nome.';
    }
    return `Este ${context?.entity || 'registro'} já existe no sistema.`;
  }

  // 4. Erros de validação
  if (errorMessage.includes('violates check constraint') || errorMessage.includes('invalid input') || errorCode === '23514') {
    if (errorMessage.includes('email')) {
      return 'E-mail inválido. Verifique o formato (exemplo@dominio.com).';
    }
    if (errorMessage.includes('telefone') || errorMessage.includes('phone')) {
      return 'Telefone inválido. Use apenas números.';
    }
    return 'Alguns dados estão incorretos. Verifique os campos obrigatórios e tente novamente.';
  }

  // 5. Erros de chave estrangeira (referência inválida)
  if (errorMessage.includes('foreign key') || errorCode === '23503') {
    return 'Não foi possível completar a ação porque este registro está vinculado a outros dados. Remova as dependências primeiro.';
  }

  // 6. Erros de rede/conexão
  if (
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorCode === 'econnrefused'
  ) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // 7. Erros de limite excedido
  if (errorMessage.includes('quota exceeded') || errorMessage.includes('limit')) {
    return 'Limite de uso excedido. Entre em contato com o suporte para aumentar sua cota.';
  }

  // 8. Erros de arquivo/upload
  if (errorMessage.includes('file') || errorMessage.includes('upload')) {
    if (errorMessage.includes('size') || errorMessage.includes('large')) {
      return 'O arquivo é muito grande. Tente reduzir o tamanho e enviar novamente.';
    }
    if (errorMessage.includes('type') || errorMessage.includes('format')) {
      return 'Formato de arquivo não suportado. Use um formato válido.';
    }
    return 'Erro ao fazer upload do arquivo. Tente novamente.';
  }

  // 9. Erros específicos por contexto
  if (context?.action && context?.entity) {
    const actionText = {
      criar: 'criar',
      atualizar: 'atualizar',
      deletar: 'excluir',
      buscar: 'buscar',
      enviar: 'enviar',
      carregar: 'carregar',
    }[context.action];

    const entityText = {
      cliente: 'o cliente',
      lead: 'o lead',
      oportunidade: 'a oportunidade',
      evento: 'o evento',
      intervenção: 'a intervenção',
      avaliação: 'a avaliação',
      contato: 'o contato',
      categoria: 'a categoria',
      questionário: 'o questionário',
      depoimento: 'o depoimento',
    }[context.entity];

    return `Não foi possível ${actionText} ${entityText}. Verifique os dados e tente novamente.`;
  }

  // 10. Mensagem genérica (fallback)
  return 'Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.';
}

/**
 * Retorna uma mensagem de sucesso padronizada
 */
export function getSuccessMessage(context: {
  action: 'criar' | 'atualizar' | 'deletar' | 'enviar';
  entity: 'cliente' | 'lead' | 'oportunidade' | 'evento' | 'intervenção' | 'avaliação' | 'contato' | 'categoria' | 'questionário' | 'depoimento';
  gender?: 'o' | 'a';
}): { title: string; description: string } {
  const { action, entity, gender = 'o' } = context;

  const actionText = {
    criar: gender === 'a' ? 'criada' : 'criado',
    atualizar: gender === 'a' ? 'atualizada' : 'atualizado',
    deletar: gender === 'a' ? 'excluída' : 'excluído',
    enviar: gender === 'a' ? 'enviada' : 'enviado',
  }[action];

  const entityText = {
    cliente: 'Cliente',
    lead: 'Lead',
    oportunidade: 'Oportunidade',
    evento: 'Evento',
    intervenção: 'Intervenção',
    avaliação: 'Avaliação',
    contato: 'Contato',
    categoria: 'Categoria',
    questionário: 'Questionário',
    depoimento: 'Depoimento',
  }[entity];

  return {
    title: `${entityText} ${actionText}${gender === 'a' ? '' : ''}`,
    description: `${gender === 'a' ? 'A' : 'O'} ${entity} foi ${actionText}${gender === 'a' ? '' : ''} com sucesso.`,
  };
}
