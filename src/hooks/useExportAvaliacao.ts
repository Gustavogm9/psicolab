import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';
import { Database } from '@/integrations/supabase/types';

type Avaliacao = Database['public']['Tables']['avaliacoes']['Row'] & {
  cliente?: { nome: string } | null;
};
type Participante = Database['public']['Tables']['avaliacoes_participantes']['Row'];
type Questao = Database['public']['Tables']['avaliacoes_questoes']['Row'];

export const useExportAvaliacao = () => {
  const exportarCSV = async (avaliacaoId: string) => {
    try {
      // Buscar dados da avaliação
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('id', avaliacaoId)
        .single();

      if (avaliacaoError) throw avaliacaoError;

      // Buscar questões
      const { data: questoes, error: questoesError } = await supabase
        .from('avaliacoes_questoes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .order('ordem');

      if (questoesError) throw questoesError;

      // Buscar participantes e respostas
      const { data: participantes, error: participantesError } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (participantesError) throw participantesError;

      // Gerar CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Cabeçalho do CSV
      csvContent += "Avaliação: " + avaliacao.nome + "\n";
      csvContent += "Tipo: " + avaliacao.tipo + "\n";
      csvContent += "Status: " + avaliacao.status + "\n";
      
      const clienteNome = (avaliacao as any).cliente?.nome;
      if (clienteNome) {
        csvContent += "Cliente: " + clienteNome + "\n";
      }
      csvContent += "Data Início: " + (avaliacao.data_inicio ? new Date(avaliacao.data_inicio).toLocaleDateString('pt-BR') : 'N/A') + "\n";
      csvContent += "Data Fim: " + (avaliacao.data_fim ? new Date(avaliacao.data_fim).toLocaleDateString('pt-BR') : 'N/A') + "\n";
      csvContent += "Participantes Total: " + (avaliacao.participantes_total || 0) + "\n";
      csvContent += "Participantes Responderam: " + (avaliacao.participantes_responderam || 0) + "\n";
      csvContent += "Progresso: " + (avaliacao.progresso || 0) + "%\n\n";

      // Respostas dos participantes
      csvContent += "RESPOSTAS DOS PARTICIPANTES\n\n";
      
      if (participantes && participantes.length > 0) {
        participantes.forEach((participante: Participante, idx: number) => {
          csvContent += `\nParticipante ${idx + 1}\n`;
          csvContent += "Nome: " + (participante.nome || 'Anônimo') + "\n";
          csvContent += "Email: " + (participante.email || 'N/A') + "\n";
          csvContent += "Data Convite: " + (participante.data_convite ? new Date(participante.data_convite).toLocaleDateString('pt-BR') : 'N/A') + "\n";
          csvContent += "Data Resposta: " + (participante.data_resposta ? new Date(participante.data_resposta).toLocaleDateString('pt-BR') : 'N/A') + "\n";
          csvContent += "Respondido: " + (participante.respondido ? 'Sim' : 'Não') + "\n";
          
          if (participante.respostas) {
            csvContent += "\nRespostas:\n";
            const respostas = participante.respostas;
            
            questoes?.forEach((questao: Questao, qIdx: number) => {
              let respostaVal: any = null;
              
              if (Array.isArray(respostas)) {
                let found = respostas.find((r: any) => r && (r.questao_id === questao.id || r.id === questao.id));
                if (!found && qIdx < respostas.length) {
                  found = respostas[qIdx];
                }
                respostaVal = found ? (found.resposta ?? found.value) : null;
              } else if (typeof respostas === 'object' && respostas !== null) {
                respostaVal = (respostas as Record<string, any>)[questao.id];
              }
              
              csvContent += `"Questão: ${questao.pergunta}","Resposta: ${respostaVal ?? 'Não respondida'}"\n`;
            });
          }
          
          csvContent += "\n" + "-".repeat(50) + "\n";
        });
      } else {
        csvContent += "Nenhum participante ainda.\n";
      }

      // Criar link de download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `avaliacao_${avaliacao.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Arquivo CSV baixado com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar avaliação',
        description: getUserFriendlyError(error, { action: 'exportar', entity: 'avaliação' }),
        variant: 'destructive',
      });
      return false;
    }
  };

  const exportarHistoricoCSV = async (avaliacoes: Avaliacao[]) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Cabeçalho
      csvContent += "Nome,Tipo,Status,Cliente,Data Início,Data Fim,Participantes Total,Participantes Responderam,Progresso (%)\n";
      
      // Dados
      avaliacoes.forEach((avaliacao: Avaliacao) => {
        const linha = [
          avaliacao.nome,
          avaliacao.tipo,
          avaliacao.status,
          avaliacao.cliente?.nome || 'N/A',
          avaliacao.data_inicio ? new Date(avaliacao.data_inicio).toLocaleDateString('pt-BR') : 'N/A',
          avaliacao.data_fim ? new Date(avaliacao.data_fim).toLocaleDateString('pt-BR') : 'N/A',
          avaliacao.participantes_total || 0,
          avaliacao.participantes_responderam || 0,
          avaliacao.progresso || 0
        ];
        csvContent += linha.map(campo => `"${campo}"`).join(',') + "\n";
      });

      // Criar link de download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `historico_avaliacoes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Histórico exportado com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar histórico',
        description: getUserFriendlyError(error, { action: 'exportar', entity: 'avaliação' }),
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    exportarCSV,
    exportarHistoricoCSV,
  };
};
