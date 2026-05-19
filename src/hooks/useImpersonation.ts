import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useImpersonation() {
  const {
    user,
    userRole,
    isImpersonating,
    impersonatedUserId,
    impersonatedProfile,
    effectiveUserId,
    startImpersonation,
    stopImpersonation
  } = useAuth();

  // Verificar se o usuário atual é admin
  const isAdmin = userRole === "admin";

  // Registrar ação durante impersonificação
  const logAction = async (actionType: string, details: Record<string, any> = {}) => {
    if (!isImpersonating || !user || !impersonatedUserId) return;

    try {
      await supabase.from("admin_impersonation_logs").insert({
        admin_id: user.id,
        target_user_id: impersonatedUserId,
        action_type: "action",
        action_details: {
          action: actionType,
          ...details,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Erro ao registrar ação de impersonificação:", error);
    }
  };

  // Iniciar com validação adicional
  const start = async (targetUserId: string) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem usar impersonificação");
      return { success: false, error: "Não autorizado" };
    }

    return await startImpersonation(targetUserId);
  };

  // Encerrar impersonificação
  const stop = async () => {
    await stopImpersonation();
  };

  return {
    isAdmin,
    isImpersonating,
    impersonatedUserId,
    impersonatedProfile,
    effectiveUserId,
    startImpersonation: start,
    stopImpersonation: stop,
    logAction
  };
}
