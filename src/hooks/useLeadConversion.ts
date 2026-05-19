import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface ConvertLeadData {
  leadId: string;
  nome: string;
  responsavel: string;
  email: string;
  telefone?: string;
  endereco?: string;
  colaboradores?: number;
  tipo?: string;
}

interface AutoConvertLeadData {
  lead: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
    colaboradores?: number;
    tipo?: string;
    cliente_id?: string;
  };
  oportunidadeId: string;
}

// Hook para conversão automática quando oportunidade é ganha
export const useAutoConvertLead = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async ({ lead, oportunidadeId }: AutoConvertLeadData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Se já é cliente, apenas retornar os dados existentes
      if (lead.cliente_id) {
        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select()
          .eq('id', lead.cliente_id)
          .single();
        
        if (clienteExistente) return clienteExistente;
      }

      // FASE 1.2: Verificar se já existe cliente com mesmo email antes de criar (apenas se email existe)
      if (lead.email && lead.email.trim() !== '') {
        const { data: clienteExistentePorEmail } = await supabase
          .from('clientes')
          .select('id, nome')
          .eq('email', lead.email)
          .eq('consultora_id', effectiveUserId)
          .maybeSingle();

        if (clienteExistentePorEmail) {
          // Atualizar lead com cliente existente
          await supabase
            .from('leads_diagnostico')
            .update({ cliente_id: clienteExistentePorEmail.id })
            .eq('id', lead.id);
          
          return clienteExistentePorEmail;
        }
      }

      // Só cria novo cliente se não existir
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          consultora_id: effectiveUserId,
          nome: lead.nome,
          responsavel: lead.nome,
          email: lead.email,
          telefone: lead.telefone,
          cpf_cnpj: (lead as any).cpf_cnpj || null,
          endereco: lead.endereco,
          tipo: lead.tipo || 'Corporativo',
          status: 'Ativo',
          colaboradores: lead.colaboradores || 0,
        })
        .select()
        .single();

      if (clienteError) throw clienteError;

      // Atualizar lead com cliente_id
      await supabase
        .from('leads_diagnostico')
        .update({ cliente_id: cliente.id })
        .eq('id', lead.id);

      // Copiar contatos do lead para o cliente
      const { data: leadContatos } = await supabase
        .from('leads_contatos')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('ativo', true);
      
      if (leadContatos && leadContatos.length > 0) {
        const clienteContatos = leadContatos.map(c => ({
          cliente_id: cliente.id,
          nome: c.nome,
          cargo: c.cargo,
          email: c.email,
          telefone: c.telefone,
          principal: c.principal,
        }));
        
        await supabase.from('clientes_contatos').insert(clienteContatos);
      }

      // Registrar conversão no histórico
      await supabase.from('leads_historico').insert({
        lead_id: lead.id,
        tipo: 'convertido',
        descricao: `Lead automaticamente convertido em cliente: ${cliente.nome}`,
      });

      return cliente;
    },
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['oportunidades-crm'] });
      
      toast({
        title: 'Lead convertido automaticamente!',
        description: `${cliente.nome} foi adicionado como cliente.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao converter lead:', error);
      toast({
        title: 'Erro ao converter lead',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'cliente' }),
        variant: 'destructive',
      });
    },
  });
};
