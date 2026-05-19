import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ExternalLink,
  Share2,
  BarChart3,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConfiguracaoCompletaProps {
  slug: string;
  ativo: boolean;
  onNavigateToAnalytics: () => void;
}

export function ConfiguracaoCompleta({
  slug,
  ativo,
  onNavigateToAnalytics,
}: ConfiguracaoCompletaProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/perfil/${slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: "Minha Página Profissional",
        url: publicUrl,
      });
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-primary/10">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Parabéns! Perfil Completo
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Seu perfil está pronto para atrair clientes! 
              {ativo ? " Sua página está ativa e visível." : " Ative sua página para começar a receber visitantes."}
            </p>
          </div>

          {ativo && (
            <>
              <div className="bg-background border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Sua página pública:</p>
                  <Badge variant="outline" className="text-primary">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <code className="flex-1 text-sm text-primary truncate">
                    {publicUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/perfil/${slug}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Página
                </Button>
                <Button variant="outline" onClick={handleShareUrl}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="default" onClick={onNavigateToAnalytics}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Analytics
                </Button>
              </div>
            </>
          )}

          {!ativo && (
            <div className="bg-muted/50 border border-dashed rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Próximo passo:</strong> Ative sua página no switch no topo da página
                para torná-la visível e começar a captar leads!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
