import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/useImpersonation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { useWhiteLabelContext } from "@/contexts/WhiteLabelContext";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedProfile, stopImpersonation } = useImpersonation();
  const queryClient = useQueryClient();
  const { refetch: refetchWhiteLabel } = useWhiteLabelContext();

  if (!isImpersonating || !impersonatedProfile) return null;

  const handleStopImpersonation = async () => {
    await stopImpersonation();
    // Aguardar ciclo de renderização para garantir que o estado do contexto foi atualizado
    await new Promise(resolve => setTimeout(resolve, 100));
    // Refazer busca das configurações de marca para restaurar tema do admin
    await refetchWhiteLabel();
    // Invalidar cache para forçar refetch com dados do admin
    await queryClient.invalidateQueries();
  };

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-0 border-b-2 border-destructive bg-destructive/10 backdrop-blur-sm">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-semibold text-destructive">
            Modo Impersonificação Ativo
          </span>
          <span className="text-sm text-muted-foreground">
            Você está agindo como <strong>{impersonatedProfile.name}</strong>
          </span>
        </div>
        <Button
          onClick={handleStopImpersonation}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Encerrar
        </Button>
      </AlertDescription>
    </Alert>
  );
}
