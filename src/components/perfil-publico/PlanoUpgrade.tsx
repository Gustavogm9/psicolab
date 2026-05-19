import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

interface PlanoUpgradeProps {
  perfilId: string;
  planoAtualId?: string;
}

export default function PlanoUpgrade({ perfilId, planoAtualId }: PlanoUpgradeProps) {
  const { data: planos, isLoading } = useQuery({
    queryKey: ["perfil-publico-planos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil_publico_planos")
        .select("*")
        .eq("ativo", true)
        .order("ordem");

      if (error) throw error;
      return data;
    },
  });

  const handleUpgrade = async (planoId: string) => {
    const { error } = await supabase
      .from("perfis_publicos")
      .update({
        plano_id: planoId,
        plano_expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      })
      .eq("id", perfilId);

    if (error) {
      toast.error("Erro ao fazer upgrade do plano");
    } else {
      toast.success("Plano atualizado com sucesso!");
      window.location.reload();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando planos...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {planos?.map((plano) => {
        const isPlanoAtual = plano.id === planoAtualId;
        const features = Array.isArray(plano.features) ? plano.features : [];

        return (
          <Card key={plano.id} className={isPlanoAtual ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                {isPlanoAtual && <Badge variant="default">Atual</Badge>}
              </div>
              <CardDescription>{plano.descricao}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  R$ {plano.preco_mensal.toFixed(2)}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={isPlanoAtual ? "outline" : "default"}
                disabled={isPlanoAtual}
                onClick={() => handleUpgrade(plano.id)}
              >
                {isPlanoAtual ? (
                  "Plano Atual"
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Fazer Upgrade
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
