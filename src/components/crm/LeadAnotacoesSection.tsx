import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2 } from "lucide-react";
import { useLeadAnotacoes, useLeadAnotacaoCreate, useLeadAnotacaoDelete } from "@/hooks/useLeadAnotacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LeadAnotacoesSectionProps {
  leadId: string;
}

export function LeadAnotacoesSection({ leadId }: LeadAnotacoesSectionProps) {
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const { data: anotacoes = [] } = useLeadAnotacoes(leadId);
  const createAnotacao = useLeadAnotacaoCreate();
  const deleteAnotacao = useLeadAnotacaoDelete();

  const handleAddAnotacao = async () => {
    if (!novaAnotacao.trim()) return;
    
    await createAnotacao.mutateAsync({
      leadId,
      texto: novaAnotacao,
    });
    setNovaAnotacao("");
  };

  const handleDeleteAnotacao = (anotacaoId: string) => {
    deleteAnotacao.mutate({ id: anotacaoId, leadId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Anotações ({anotacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Adicionar nova anotação..."
            value={novaAnotacao}
            onChange={(e) => setNovaAnotacao(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddAnotacao}
            disabled={!novaAnotacao.trim() || createAnotacao.isPending}
            size="sm"
          >
            Adicionar Anotação
          </Button>
        </div>

        <div className="space-y-3">
          {anotacoes.map((anotacao: any) => (
            <Card key={anotacao.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{anotacao.texto}</p>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(anotacao.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAnotacao(anotacao.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}

          {anotacoes.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              Nenhuma anotação ainda
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
