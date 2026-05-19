import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompartilharAvaliacao } from './CompartilharAvaliacao';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvaliacaoUpdate } from '@/hooks/useAvaliacaoUpdate';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface AvaliacaoData {
  id: string;
  nome: string;
  slug?: string | null;
  tipo_acesso?: 'publico' | 'restrito' | null;
  permite_auto_identificacao?: boolean | null;
}

interface CompartilharAvaliacaoDialogProps {
  avaliacao: {
    id: string;
    nome: string;
    slug?: string;
    tipo_acesso?: 'publico' | 'restrito';
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompartilharAvaliacaoDialog = ({
  avaliacao,
  open,
  onOpenChange,
}: CompartilharAvaliacaoDialogProps) => {
  const navigate = useNavigate();
  const updateAvaliacao = useAvaliacaoUpdate();
  const [isActivating, setIsActivating] = useState(false);

  // Query para manter dados atualizados da avaliação
  const { data: avaliacaoAtualizada, refetch: refetchAvaliacao } = useQuery({
    queryKey: ['avaliacao-compartilhar', avaliacao?.id],
    queryFn: async () => {
      if (!avaliacao?.id) return null;
      
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('id, nome, slug, tipo_acesso, permite_auto_identificacao')
        .eq('id', avaliacao.id)
        .single();

      if (error) throw error;
      return data as AvaliacaoData;
    },
    enabled: !!avaliacao?.id && open,
  });

  const { data: participantes, isLoading, refetch } = useQuery({
    queryKey: ['avaliacoes-participantes', avaliacao?.id],
    queryFn: async () => {
      if (!avaliacao?.id) return [];
      
      const { data, error } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacao.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!avaliacao?.id && open,
  });

  const handleNavigateToParticipantes = () => {
    onOpenChange(false);
    navigate(`/avaliacoes/editar/${avaliacao?.id}?tab=participantes`);
  };

  const handleAtivarLinkGeral = async () => {
    if (!avaliacao) return;
    
    setIsActivating(true);
    try {
      await updateAvaliacao.mutateAsync({
        id: avaliacao.id,
        nome: avaliacao.nome,
        tipo_acesso: 'restrito',
        permite_auto_identificacao: true,
      });
      
      // Recarrega dados da avaliação e participantes
      await refetchAvaliacao();
      await refetch();
      
      toast({
        title: 'Link Geral Ativado!',
        description: 'Agora você pode compartilhar um único link para todos os participantes',
      });
    } catch (error) {
      console.error('Erro ao ativar link geral:', error);
      toast({
        title: 'Erro ao ativar',
        description: 'Não foi possível ativar o link geral. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (!avaliacao) return null;

  // Usa dados atualizados ou prop original como fallback
  const dadosAvaliacao = avaliacaoAtualizada || avaliacao;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compartilhar: {dadosAvaliacao.nome}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CompartilharAvaliacao
            avaliacao={dadosAvaliacao}
            participantes={participantes}
            onNavigateToParticipantes={handleNavigateToParticipantes}
            onAtivarLinkGeral={handleAtivarLinkGeral}
            isActivating={isActivating}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
