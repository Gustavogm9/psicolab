import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RespostaPublicaData {
  avaliacaoId: string;
  nome?: string;
  email?: string;
  setor?: string;
  cargo?: string;
  respostas: any;
}

interface RespostaTokenData {
  participanteId: string;
  respostas: any;
}

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

// Função auxiliar para inserir resposta com retry e fallback
const insertRespostaWithRetry = async (
  data: RespostaPublicaData,
  retries = 2
): Promise<any> => {
  const payload = {
    avaliacao_id: data.avaliacaoId,
    nome: data.nome || null,
    email: data.email || null,
    setor: data.setor || null,
    cargo: data.cargo || null,
    respostas: data.respostas,
    respondido: true,
    data_resposta: new Date().toISOString(),
  };

  try {
    const { data: resposta, error } = await supabase
      .from('avaliacoes_respostas_publicas')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return resposta;
  } catch (error: any) {
    // Log detalhado para debug
    console.error('❌ Erro ao inserir resposta:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      isMobile: isMobileEnvironment(),
      localStorage: isStorageAvailable('localStorage'),
      sessionStorage: isStorageAvailable('sessionStorage'),
      retries,
    });

    // Retry logic para erros temporários
    if (retries > 0 && (error.code === 'PGRST301' || error.message?.includes('network'))) {
      console.log(`🔄 Tentando novamente... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s
      return insertRespostaWithRetry(data, retries - 1);
    }

    throw error;
  }
};

export const useRespostaPublicaCreate = () => {
  return useMutation({
    mutationFn: async (data: RespostaPublicaData) => {
      // Validação de dados obrigatórios
      if (!data.avaliacaoId) {
        throw new Error('ID da avaliação é obrigatório');
      }

      if (!data.respostas || Object.keys(data.respostas).length === 0) {
        throw new Error('É necessário responder pelo menos uma questão');
      }

      console.log('📤 Enviando resposta:', {
        avaliacaoId: data.avaliacaoId,
        questoesRespondidas: Object.keys(data.respostas).length,
        isMobile: isMobileEnvironment(),
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 100),
      });

      // Usar função com retry
      return await insertRespostaWithRetry(data);
    },
    onSuccess: (data) => {
      console.log('✅ Resposta enviada com sucesso:', data.id);
      toast({
        title: 'Resposta enviada!',
        description: 'Obrigado por participar da avaliação.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro final ao enviar resposta:', error);

      // Mensagens específicas por tipo de erro
      let title = 'Erro ao enviar resposta';
      let description = 'Tente novamente em alguns instantes.';

      if (error.code === 'PGRST301') {
        title = 'Avaliação não disponível';
        description = 'Esta avaliação não está ativa no momento.';
      } else if (error.message?.includes('row-level security')) {
        title = 'Acesso não permitido';
        description = 'Esta avaliação não está disponível publicamente.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        title = 'Erro de conexão';
        description = 'Verifique sua conexão com a internet e tente novamente.';
      } else if (error.message?.includes('obrigatório') || error.message?.includes('necessário')) {
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

export const useRespostaTokenUpdate = () => {
  return useMutation({
    mutationFn: async (data: RespostaTokenData) => {
      // Validação de dados obrigatórios
      if (!data.participanteId) {
        throw new Error('ID do participante é obrigatório');
      }

      if (!data.respostas || Object.keys(data.respostas).length === 0) {
        throw new Error('É necessário responder pelo menos uma questão');
      }

      console.log('📤 Atualizando resposta de participante:', {
        participanteId: data.participanteId,
        questoesRespondidas: Object.keys(data.respostas).length,
        isMobile: isMobileEnvironment(),
      });

      const { data: participante, error } = await supabase
        .from('avaliacoes_participantes')
        .update({
          respostas: data.respostas,
          respondido: true,
          data_resposta: new Date().toISOString(),
        })
        .eq('id', data.participanteId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar participante:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        throw error;
      }

      console.log('✅ Resposta de participante atualizada:', participante.id);
      return participante;
    },
    onSuccess: () => {
      toast({
        title: 'Resposta enviada!',
        description: 'Obrigado por participar da avaliação.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro final ao atualizar participante:', error);

      let title = 'Erro ao enviar resposta';
      let description = 'Tente novamente em alguns instantes.';

      if (error.code === 'PGRST116') {
        title = 'Token inválido';
        description = 'Este link de acesso não é válido ou expirou.';
      } else if (error.message?.includes('obrigatório') || error.message?.includes('necessário')) {
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
