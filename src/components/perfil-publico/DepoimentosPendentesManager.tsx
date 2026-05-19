import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, Star } from "lucide-react";
import { useDepoimentosPublicos, useDepoimentosPublicosMutations } from "@/hooks/useDepoimentosPublicos";
import { toast } from "sonner";

interface DepoimentosPendentesManagerProps {
  perfilPublicoId: string;
}

export function DepoimentosPendentesManager({ perfilPublicoId }: DepoimentosPendentesManagerProps) {
  const { data: depoimentos = [], isLoading } = useDepoimentosPublicos(perfilPublicoId);
  const { update, isUpdating } = useDepoimentosPublicosMutations();

  const depoimentosPendentes = depoimentos.filter(d => d.status === "pendente");

  const handleAprovar = async (id: string) => {
    try {
      await update({
        id,
        perfil_publico_id: perfilPublicoId,
        status: "aprovado",
      });
      toast.success(
        '✅ Depoimento aprovado!',
        {
          description: 'O depoimento agora está visível na sua página pública.'
        }
      );
    } catch (error: any) {
      toast.error('Erro ao aprovar depoimento');
    }
  };

  const handleRejeitar = async (id: string) => {
    try {
      await update({
        id,
        perfil_publico_id: perfilPublicoId,
        status: "rejeitado",
      });
      toast.success(
        'Depoimento rejeitado',
        {
          description: 'O depoimento não será exibido na sua página.'
        }
      );
    } catch (error: any) {
      toast.error('Erro ao rejeitar depoimento');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (depoimentosPendentes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum depoimento pendente de aprovação</p>
            <p className="text-sm mt-1">
              Depoimentos enviados pelos clientes aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Depoimentos Pendentes</CardTitle>
            <CardDescription>
              Revise e aprove depoimentos antes de publicá-los
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {depoimentosPendentes.length} pendente(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {depoimentosPendentes.map((depoimento) => (
          <Card key={depoimento.id} className="border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {depoimento.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{depoimento.nome}</h4>
                      {depoimento.cargo && (
                        <p className="text-sm text-muted-foreground">
                          {depoimento.cargo}
                          {depoimento.empresa && ` • ${depoimento.empresa}`}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < depoimento.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendente
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed border-l-4 border-primary/20 pl-4 py-2 bg-muted/30 rounded-r">
                  "{depoimento.texto}"
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => handleAprovar(depoimento.id)}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleRejeitar(depoimento.id)}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
