import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibliotecaIntervencoes } from "@/hooks/useBibliotecaIntervencoes";
import { useServicosPublicosMutations } from "@/hooks/useServicosPublicos";
import { Loader2, Package, Clock } from "lucide-react";
import { toast } from "sonner";

interface ServicosImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfilPublicoId: string;
}

export function ServicosImportDialog({ open, onOpenChange, perfilPublicoId }: ServicosImportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: biblioteca, isLoading } = useBibliotecaIntervencoes();
  const { create, isCreating } = useServicosPublicosMutations();

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um item para importar");
      return;
    }

    try {
      const itemsToImport = biblioteca?.filter(item => selectedIds.includes(item.id)) || [];
      
      for (const item of itemsToImport) {
        await create({
          perfil_publico_id: perfilPublicoId,
          titulo: item.titulo,
          descricao: item.descricao,
          preco: item.custo_estimado,
          duracao: item.duracao_estimada,
          icone: "Briefcase",
          modalidade: null,
          ordem: 0,
        });
      }

      toast.success(`${itemsToImport.length} serviço(s) importado(s) com sucesso!`);
      setSelectedIds([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao importar serviços:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar da Biblioteca</DialogTitle>
          <DialogDescription>
            Selecione itens da sua biblioteca de intervenções para adicionar como serviços no perfil público
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
                {biblioteca?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum item encontrado na biblioteca
                  </p>
                ) : (
                  biblioteca?.map((item) => (
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.titulo}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.categoria}
                          </Badge>
                        </div>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.duracao_estimada && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duracao_estimada}h
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
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} item(ns) selecionado(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={selectedIds.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Importar Selecionados
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
