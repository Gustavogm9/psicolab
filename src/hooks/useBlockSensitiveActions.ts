import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para bloquear ações sensíveis durante impersonificação
 */
export function useBlockSensitiveActions() {
  const { isImpersonating } = useAuth();
  const { toast } = useToast();

  const blockSensitiveAction = (actionName: string): boolean => {
    if (isImpersonating) {
      toast({
        title: "Ação bloqueada durante impersonificação",
        description: `Não é permitido ${actionName} enquanto impersonificando outro usuário. Encerre a impersonificação primeiro.`,
        variant: "destructive",
      });
      return true; // Bloqueado
    }
    return false; // Permitido
  };

  return {
    isImpersonating,
    blockSensitiveAction,
  };
}
