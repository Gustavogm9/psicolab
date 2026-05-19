import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ============================================
// FASE 2: Helpers para detecção de ambiente mobile
// ============================================

// Helper para detectar ambiente mobile
const isMobileEnvironment = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper para testar disponibilidade de storage
const isStorageAvailable = (storageType: 'localStorage' | 'sessionStorage') => {
  try {
    const storage = window[storageType];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// FASE 2: Função auxiliar com retry logic
// ============================================

// Função auxiliar para inserir resposta com retry e logging detalhado
const insertRespostaWithRetry = async (
  data: any,
  retries = 2
): Promise<any> => {
  // Log contextual para debug mobile
  console.log('📍 Contexto da requisição diagnóstico:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    href: typeof window !== 'undefined' ? window.location.href : 'N/A',
    isMobile: isMobileEnvironment(),
    localStorage: isStorageAvailable('localStorage'),
    sessionStorage: isStorageAvailable('sessionStorage'),
    questionarioId: data.questionario_id,
  });

  try {
    const { data: resposta, error } = await supabase
      .rpc('inserir_resposta_publica', {
        p_questionario_id: data.questionario_id,
        p_nome: data.nome,
        p_email: data.email,
        p_telefone: data.telefone || null,
        p_respostas: data.respostas || [],
        p_score_total: data.score_total || 0,
        p_categoria: data.categoria || null,
        p_analise_completa: data.analise_completa || null,
        p_status: data.status || 'incompleta',
        p_origem: data.origem || 'link',
      });

    if (error) throw error;

    // RPC retorna json — PostgREST pode enviar como string ou objeto
    const parsed = typeof resposta === 'string' ? JSON.parse(resposta) : resposta;
    console.log('📦 Retorno RPC inserir_resposta_publica:', { type: typeof resposta, parsed });
    return parsed;
  } catch (error: any) {
    // Log detalhado para debug
    console.error('❌ Erro ao inserir resposta diagnóstico:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      href: typeof window !== 'undefined' ? window.location.href : 'N/A',
      isMobile: isMobileEnvironment(),
      localStorage: isStorageAvailable('localStorage'),
      sessionStorage: isStorageAvailable('sessionStorage'),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A',
      retries,
    });

    // Retry para erros temporários de rede ou RLS
    if (retries > 0 && (error.code === 'PGRST301' || error.message?.includes('network') || error.message?.includes('fetch'))) {
      console.log(`🔄 Tentando novamente... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return insertRespostaWithRetry(data, retries - 1);
    }

    throw error;
  }
};

interface CreateRespostaData {
  questionarioId: string;
  nome: string;
  email: string;
  telefone?: string;
  respostas: any[];
  scoreTotal?: number;
  categoria?: string;
  analiseCompleta?: any;
  origem?: string;
}

interface UpdateRespostaData {
  id: string;
  respostas?: any[];
  status?: 'incompleta' | 'concluida' | 'abandonada';
  scoreTotal?: number;
  categoria?: string;
  analiseCompleta?: any;
  dataFim?: Date;
  tempoResposta?: number;
}

export const useRespostaCreate = () => {
  return useMutation({
    mutationFn: async (data: CreateRespostaData) => {
      // ============================================
      // FASE 2 & 3: Validação de dados obrigatórios
      // ============================================
      if (!data.questionarioId) {
        throw new Error('ID do questionário é obrigatório');
      }
      if (!data.nome || !data.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      console.log('📤 Enviando resposta diagnóstico:', {
        questionarioId: data.questionarioId,
        nome: data.nome,
        isMobile: isMobileEnvironment(),
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'N/A',
      });

      const insertData = {
        questionario_id: data.questionarioId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        respostas: data.respostas,
        score_total: data.scoreTotal || 0,
        categoria: data.categoria,
        analise_completa: data.analiseCompleta,
        origem: data.origem || 'link',
        status: 'incompleta',
      };

      return await insertRespostaWithRetry(insertData);
    },
    onSuccess: (data) => {
      console.log('✅ Resposta diagnóstico salva com sucesso:', data.id);
      toast({
        title: 'Resposta salva!',
        description: 'Seus dados foram salvos com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro final ao salvar resposta diagnóstico:', error);

      // ============================================
      // FASE 2 & 3: Mensagens específicas por tipo de erro
      // ============================================
      let title = 'Erro ao salvar resposta';
      let description = 'Tente novamente em alguns instantes.';

      if (error.code === 'PGRST301') {
        title = 'Questionário não disponível';
        description = 'Este questionário não está ativo no momento.';
      } else if (error.message?.includes('row-level security')) {
        title = 'Acesso não permitido';
        description = 'Este questionário não está disponível para resposta.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        title = 'Erro de conexão';
        description = 'Verifique sua conexão com a internet e tente novamente.';
      } else if (error.message?.includes('obrigatório')) {
        title = 'Dados incompletos';
        description = error.message;
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });
};

export const useRespostaUpdate = () => {
  return useMutation({
    mutationFn: async (data: UpdateRespostaData) => {
      const { id, ...updateData } = data;

      console.log('📝 Atualizando resposta diagnóstico:', {
        id,
        status: updateData.status,
        isMobile: isMobileEnvironment(),
      });

      const { error } = await supabase
        .from('respostas_diagnostico')
        .update({
          ...(updateData.respostas && { respostas: updateData.respostas }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.scoreTotal !== undefined && { score_total: updateData.scoreTotal }),
          ...(updateData.categoria && { categoria: updateData.categoria }),
          ...(updateData.analiseCompleta && { analise_completa: updateData.analiseCompleta }),
          ...(updateData.dataFim && { data_fim: updateData.dataFim.toISOString() }),
          ...(updateData.tempoResposta !== undefined && { tempo_resposta: updateData.tempoResposta }),
        })
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      console.log('✅ Resposta diagnóstico atualizada com sucesso');
      toast({
        title: 'Resposta salva',
        description: 'Sua resposta foi salva com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar resposta diagnóstico:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // ============================================
      // FASE 2: Mensagens amigáveis para erros
      // ============================================
      let title = 'Erro ao salvar resposta';
      let description = 'Tente novamente em alguns instantes.';
      let variant: 'destructive' | 'default' = 'destructive';

      // Tratar erro de duplicate key (email já cadastrado) como sucesso
      if (error.message?.includes('duplicate key') ||
        error.message?.includes('unique constraint') ||
        error.message?.includes('idx_leads_email_consultora')) {
        console.log('ℹ️ Email já cadastrado - tratando como sucesso');
        title = 'Resposta já registrada';
        description = 'Suas respostas foram salvas com sucesso.';
        variant = 'default';
      }
      // Erro de RLS (acesso negado)
      else if (error.message?.includes('row-level security')) {
        title = 'Acesso não permitido';
        description = 'Este questionário não está disponível para atualização.';
      }
      // Erro de rede
      else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        title = 'Erro de conexão';
        description = 'Verifique sua conexão com a internet e tente novamente.';
      }
      // Erro de questionário inativo
      else if (error.code === 'PGRST301') {
        title = 'Questionário não disponível';
        description = 'Este questionário não está mais ativo.';
      }

      toast({
        title,
        description,
        variant,
      });
    },
  });
};
