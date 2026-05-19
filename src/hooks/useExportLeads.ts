import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';

interface Lead {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  prioridade: string;
  score: number;
  categoria: string;
  origem: string;
  valor_potencial: number;
  observacoes?: string;
  created_at: string;
}

export const useExportLeads = () => {
  const exportToCSV = (leads: Lead[], filename: string = 'leads.csv') => {
    try {
      // Definir cabeçalhos
      const headers = [
        'Nome',
        'Email',
        'Telefone',
        'Empresa',
        'Cargo',
        'Prioridade',
        'Score',
        'Categoria',
        'Origem',
        'Valor Potencial',
        'Observações',
        'Data de Criação',
      ];

      // Converter dados
      const rows = leads.map(lead => [
        lead.nome,
        lead.email,
        lead.telefone || '',
        lead.empresa || '',
        lead.cargo || '',
        lead.prioridade,
        lead.score.toString(),
        lead.categoria,
        lead.origem,
        lead.valor_potencial.toString(),
        lead.observacoes || '',
        new Date(lead.created_at).toLocaleDateString('pt-BR'),
      ]);

      // Criar CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: `${leads.length} leads exportados com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar leads',
        description: getUserFriendlyError(error, { action: 'exportar', entity: 'lead' }),
        variant: 'destructive',
      });
    }
  };

  return { exportToCSV };
};
