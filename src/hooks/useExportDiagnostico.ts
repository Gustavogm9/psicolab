import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

export const useExportDiagnostico = () => {
  const { effectiveUserId } = useAuth();
  const exportarRespostasCSV = async (questionarioId: string) => {
    try {
      // Buscar dados do questionário
      const { data: questionario, error: questionarioError } = await supabase
        .from('questionarios_diagnostico')
        .select('titulo, slug')
        .eq('id', questionarioId)
        .single();

      if (questionarioError) throw questionarioError;

      // Buscar respostas
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas_diagnostico')
        .select('*')
        .eq('questionario_id', questionarioId)
        .order('data_inicio', { ascending: false });

      if (respostasError) throw respostasError;

      if (!respostas || respostas.length === 0) {
        toast.error('Nenhuma resposta encontrada para exportar');
        return false;
      }

      // Criar conteúdo CSV
      const headers = [
        'Nome',
        'Email',
        'Telefone',
        'Status',
        'Data Início',
        'Data Fim',
        'Tempo Resposta (min)',
        'Score Total',
        'Categoria',
        'Origem'
      ];

      const rows = respostas.map(resposta => [
        resposta.nome || '',
        resposta.email || '',
        resposta.telefone || '',
        resposta.status || '',
        resposta.data_inicio ? new Date(resposta.data_inicio).toLocaleString('pt-BR') : '',
        resposta.data_fim ? new Date(resposta.data_fim).toLocaleString('pt-BR') : '',
        resposta.tempo_resposta ? Math.round(resposta.tempo_resposta / 60) : '',
        resposta.score_total || 0,
        resposta.categoria || '',
        resposta.origem || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `respostas-${questionario.slug}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Respostas exportadas com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao exportar respostas:', error);
      toast.error(getUserFriendlyError(error, { action: 'exportar', entity: 'questionário' }));
      return false;
    }
  };

  const exportarLeadsCSV = async () => {
    try {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: leads, error } = await supabase
        .from('leads_diagnostico')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!leads || leads.length === 0) {
        toast.error('Nenhum lead encontrado para exportar');
        return false;
      }

      const headers = [
        'Nome',
        'Email',
        'Telefone',
        'Categoria',
        'Score',
        'Origem',
        'Data Criação',
        'Contatado Em'
      ];

      const rows = leads.map(lead => [
        lead.nome || '',
        lead.email || '',
        lead.telefone || '',
        lead.categoria || '',
        lead.score || 0,
        lead.origem || '',
        lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '',
        lead.contatado_em ? new Date(lead.contatado_em).toLocaleString('pt-BR') : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Leads exportados com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao exportar leads:', error);
      toast.error(getUserFriendlyError(error, { action: 'exportar', entity: 'lead' }));
      return false;
    }
  };

  return {
    exportarRespostasCSV,
    exportarLeadsCSV
  };
};
