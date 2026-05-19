import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface ContatoAdicional {
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}

interface CreateLeadData {
  respostaId?: string;
  nome: string;
  responsavel?: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
  endereco?: string;
  colaboradores?: number;
  tipo?: string;
  score: number;
  categoria?: string;
  origem?: string;
  cargo?: string;
  prioridade?: 'baixa' | 'media' | 'alta';
  valorPotencial?: number;
  observacoes?: string;
  tags?: string[];
  proximoFollowup?: string;
  contatosAdicionais?: ContatoAdicional[];
}

export const useLeadsCRM = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['leads-diagnostico', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('leads_diagnostico')
        .select(`
          *,
          resposta:respostas_diagnostico!left(
            questionario:questionarios_diagnostico(titulo, slug)
          ),
          historico:leads_historico(
            id,
            tipo,
            descricao,
            data,
            created_at
          ),
          anotacoes:leads_anotacoes(
            id,
            texto,
            autor_id,
            created_at
          )
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useLeadCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Verificar se já existe lead para esta resposta (apenas se respostaId existir)
      if (data.respostaId) {
        const { data: existingLead, error: checkError } = await supabase
          .from('leads_diagnostico')
          .select('id, nome')
          .eq('resposta_id', data.respostaId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingLead) {
          throw new Error(`Este respondente já está no CRM como "${existingLead.nome}"`);
        }
      }

      // Verificar email duplicado para leads manuais (apenas se email foi fornecido)
      if (!data.respostaId && data.email && data.email.trim() !== '') {
        const { data: duplicateEmail } = await supabase
          .from('leads_diagnostico')
          .select('id, nome, email, empresa, status_crm')
          .eq('email', data.email)
          .eq('consultora_id', effectiveUserId)
          .maybeSingle();

        if (duplicateEmail) {
          const error: any = new Error('Email já cadastrado');
          error.duplicate = duplicateEmail;
          throw error;
        }
      }

      const { data: lead, error } = await supabase
        .from('leads_diagnostico')
        .insert({
          consultora_id: effectiveUserId,
          resposta_id: data.respostaId || null,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cpf_cnpj: data.cpf_cnpj,
          endereco: data.endereco,
          colaboradores: data.colaboradores || 0,
          tipo: data.tipo,
          score: data.score,
          categoria: data.categoria,
          origem: data.origem,
          empresa: data.nome, // Manter compatibilidade com campo antigo
          cargo: data.cargo,
          prioridade: data.prioridade || 'media',
          valor_potencial: data.valorPotencial || 0,
          observacoes: data.observacoes,
          tags: data.tags || [],
          proximo_followup: data.proximoFollowup,
          status_crm: 'novo', // ← FASE 1.1: Garantir status inicial
        })
        .select()
        .single();

      if (error) throw error;

      // OTIMIZAÇÃO: Executar operações em PARALELO após criar o lead
      const probabilidadeInicial = data.score === null || data.score === 0
        ? 50  // Padrão para leads sem score (manuais)
        : data.score >= 80 ? 70 : data.score >= 60 ? 50 : 30;

      // Preparar contatos adicionais
      const contatosValidos = data.contatosAdicionais?.filter(c => c.nome.trim() !== '') || [];
      const contatosParaInserir = contatosValidos.map(contato => ({
        lead_id: lead.id,
        nome: contato.nome,
        cargo: contato.cargo || null,
        email: contato.email || null,
        telefone: contato.telefone || null,
        principal: false,
      }));

      // Executar todas as operações em paralelo
      const [oportunidadeResult, historicoResult, contatoPrincipalResult, contatosResult] = await Promise.allSettled([
        // Criar oportunidade padrão
        supabase.from('oportunidades').insert({
          consultora_id: effectiveUserId,
          lead_id: lead.id,
          titulo: `Negócio com ${data.nome}`,
          estagio: 'prospecção',
          probabilidade: probabilidadeInicial,
          valor_estimado: data.valorPotencial || 0,
          origem: data.origem,
        }),

        // Registrar criação no histórico
        supabase.from('leads_historico').insert({
          lead_id: lead.id,
          tipo: 'criado',
          descricao: data.respostaId
            ? 'Lead criado automaticamente a partir de diagnóstico'
            : 'Lead criado manualmente',
        }),

        // Criar contato principal
        data.nome ? supabase.from('leads_contatos').insert({
          lead_id: lead.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargo: data.cargo,
          principal: true,
        }) : Promise.resolve({ error: null }),

        // Criar contatos adicionais
        contatosParaInserir.length > 0
          ? supabase.from('leads_contatos').insert(contatosParaInserir)
          : Promise.resolve({ error: null }),
      ]);

      // Processar resultados e exibir avisos se necessário
      const avisos: string[] = [];

      if (oportunidadeResult.status === 'rejected') {
        console.error('Erro ao criar oportunidade:', oportunidadeResult.reason);
        avisos.push('oportunidade padrão não pôde ser criada');
      }

      if (historicoResult.status === 'rejected') {
        console.error('Erro ao registrar histórico:', historicoResult.reason);
      }

      if (contatoPrincipalResult.status === 'rejected') {
        console.error('Erro ao criar contato principal:', contatoPrincipalResult.reason);
      }

      if (contatosResult.status === 'rejected') {
        console.error('Erro ao criar contatos adicionais:', contatosResult.reason);
        if (contatosValidos.length > 0) {
          avisos.push(`${contatosValidos.length} contato(s) adicional(is) não pôde(ram) ser salvo(s)`);
        }
      }

      // Mostrar feedback ao usuário (aviso OU sucesso, nunca os dois)
      if (avisos.length > 0) {
        toast.warning(`Lead criado, mas: ${avisos.join(', ')}.`);
      } else {
        toast.success('Lead adicionado ao CRM com sucesso.');
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      queryClient.invalidateQueries({ queryKey: ['questionarios'] });
      // Toast de sucesso já é exibido no mutationFn (com ou sem avisos)
    },
    onError: (error: any) => {
      // Não mostrar toast para duplicatas, será tratado no componente
      if (!error.duplicate) {
        toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'lead' }));
      }
    },
  });
};

export const useLeadUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      nome?: string;
      responsavel?: string;
      email?: string;
      telefone?: string;
      cpf_cnpj?: string;
      endereco?: string;
      colaboradores?: number;
      tipo?: string;
      cargo?: string;
      prioridade?: 'baixa' | 'media' | 'alta';
      valorPotencial?: number;
      observacoes?: string;
      tags?: string[];
      proximoFollowup?: string;
      ultimoContato?: string;
      score?: number;
    }) => {
      const updateData: any = {};
      if (updates.nome !== undefined) updateData.nome = updates.nome;
      if (updates.responsavel !== undefined) updateData.responsavel = updates.responsavel;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.telefone !== undefined) updateData.telefone = updates.telefone;
      if (updates.cpf_cnpj !== undefined) updateData.cpf_cnpj = updates.cpf_cnpj;
      if (updates.endereco !== undefined) updateData.endereco = updates.endereco;
      if (updates.colaboradores !== undefined) updateData.colaboradores = updates.colaboradores;
      if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
      if (updates.cargo !== undefined) updateData.cargo = updates.cargo;
      if (updates.prioridade !== undefined) updateData.prioridade = updates.prioridade;
      if (updates.valorPotencial !== undefined) updateData.valor_potencial = updates.valorPotencial;
      if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.proximoFollowup !== undefined) updateData.proximo_followup = updates.proximoFollowup;
      if (updates.ultimoContato !== undefined) updateData.ultimo_contato = updates.ultimoContato;
      if (updates.score !== undefined) updateData.score = updates.score;

      const { data, error } = await supabase
        .from('leads_diagnostico')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Sincronizar contato principal se houver alterações relevantes
      const contatoUpdates: any = {};
      if (updates.nome !== undefined) contatoUpdates.nome = updates.nome;
      if (updates.email !== undefined) contatoUpdates.email = updates.email;
      if (updates.telefone !== undefined) contatoUpdates.telefone = updates.telefone;
      if (updates.cargo !== undefined) contatoUpdates.cargo = updates.cargo;

      if (Object.keys(contatoUpdates).length > 0) {
        // Buscar contato principal
        const { data: contatoPrincipal } = await supabase
          .from('leads_contatos')
          .select('id')
          .eq('lead_id', id)
          .eq('principal', true)
          .eq('ativo', true)
          .maybeSingle();

        if (contatoPrincipal) {
          // Atualizar contato principal existente
          await supabase
            .from('leads_contatos')
            .update(contatoUpdates)
            .eq('id', contatoPrincipal.id);
        } else if (updates.nome) {
          // Criar contato principal se não existir e houver nome
          await supabase
            .from('leads_contatos')
            .insert({
              lead_id: id,
              nome: updates.nome,
              email: updates.email,
              telefone: updates.telefone,
              cargo: updates.cargo,
              principal: true,
            });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      toast.success('As informações do lead foram atualizadas.');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'lead' }));
    },
  });
};

export const useLeadDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // 1. Deletar oportunidades vinculadas
      const { error: oportunidadesError } = await supabase
        .from('oportunidades')
        .delete()
        .eq('lead_id', leadId);

      if (oportunidadesError) throw oportunidadesError;

      // 2. Deletar eventos vinculados
      const { error: eventosError } = await supabase
        .from('eventos')
        .delete()
        .eq('lead_id', leadId);

      if (eventosError) throw eventosError;

      // 3. Deletar dados auxiliares (em paralelo)
      const [contatosResult, anotacoesResult, historicoResult, interacoesResult] = await Promise.allSettled([
        supabase.from('leads_contatos').delete().eq('lead_id', leadId),
        supabase.from('leads_anotacoes').delete().eq('lead_id', leadId),
        supabase.from('leads_historico').delete().eq('lead_id', leadId),
        supabase.from('leads_interacoes').delete().eq('lead_id', leadId),
      ]);

      // Log de erros não-críticos
      [contatosResult, anotacoesResult, historicoResult, interacoesResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Erro ao deletar dados auxiliares [${index}]:`, result.reason);
        }
      });

      // 4. Deletar o lead
      const { error } = await supabase
        .from('leads_diagnostico')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('O lead e todos os dados relacionados foram removidos.');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'lead' }));
    },
  });
};
