import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  department: string | null;
  organization_id: string;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
}

export function useTeamInvites() {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ["team-invites", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("team_invites")
        .select("*")
        .eq("organization_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamInvite[];
    },
  });
}

export function useTeamInvitesMutations() {
  const queryClient = useQueryClient();

  const { effectiveUserId } = useAuth();

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; department?: string }) => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const { data: result, error } = await supabase
        .from("team_invites")
        .insert({
          ...data,
          organization_id: effectiveUserId,
          invited_by: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
      toast.success("Convite enviado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'enviar', entity: 'convite' }));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("team_invites")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
      toast.success("Convite cancelado!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'cancelar', entity: 'convite' }));
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("team_invites")
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
      toast.success("Convite reenviado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'reenviar', entity: 'convite' }));
    },
  });

  return {
    create: createMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    resend: resendMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isResending: resendMutation.isPending,
  };
}
