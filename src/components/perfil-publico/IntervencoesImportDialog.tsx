import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntervencoes } from "@/hooks/useIntervencoes";
import { usePortfolioImagens } from "@/hooks/usePortfolioImagens";
import { Loader2, Image as ImageIcon, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IntervencoesImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfilPublicoId: string;
}

export function IntervencoesImportDialog({ open, onOpenChange, perfilPublicoId }: IntervencoesImportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { data: intervencoes, isLoading } = useIntervencoes();
  const { refetch: refetchPortfolio } = usePortfolioImagens(perfilPublicoId);

  // Filtrar apenas intervenções concluídas ou em andamento com progresso significativo
  const intervencoesElegiveis = intervencoes?.filter(
    (int) => int.status === 'concluida' || (int.status === 'em_andamento' && (int.progresso || 0) >= 50)
  );

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos uma intervenção para importar");
      return;
    }

    setIsImporting(true);
    try {
      const itemsToImport = intervencoesElegiveis?.filter(item => selectedIds.includes(item.id)) || [];
      
      for (const item of itemsToImport) {
        // Criar entrada no portfólio sem imagem (usuário pode adicionar depois)
        const { error } = await supabase
          .from('portfolio_imagens')
          .insert({
            perfil_publico_id: perfilPublicoId,
            titulo: item.titulo,
            descricao: item.resultados_obtidos || item.descricao || `Intervenção de ${item.categoria}`,
            categoria: item.categoria,
            imagem_url: '', // Será adicionada depois pelo usuário
            destaque: item.status === 'concluida',
            ordem: 0,
          });

        if (error) throw error;
      }

      toast.success(`${itemsToImport.length} intervenção(ões) importada(s) com sucesso!`);
      toast.info("Adicione imagens às intervenções importadas na seção de portfólio");
      
      await refetchPortfolio();
      setSelectedIds([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao importar intervenções:", error);
      toast.error("Erro ao importar intervenções. Tente novamente.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Casos de Sucesso</DialogTitle>
          <DialogDescription>
            Selecione intervenções concluídas ou em andamento para adicionar ao seu portfólio
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {!intervencoesElegiveis || intervencoesElegiveis.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma intervenção elegível encontrada. Complete ou avance em suas intervenções para importá-las.
                  </p>
                ) : (
                  intervencoesElegiveis.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => handleToggle(item.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => handleToggle(item.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{item.titulo}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.categoria}
                          </Badge>
                          {item.status === 'concluida' ? (
                            <Badge className="text-xs bg-green-500/10 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluída
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {item.progresso}% Completo
                            </Badge>
                          )}
                        </div>
                        {item.resultados_obtidos && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.resultados_obtidos}
                          </p>
                        )}
                        {item.descricao && !item.resultados_obtidos && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.data_inicio && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length} intervenção(ões) selecionada(s)
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Você poderá adicionar imagens depois
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={selectedIds.length === 0 || isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Importar Selecionadas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
