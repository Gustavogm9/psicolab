import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  department: string | null;
  status: "active" | "inactive" | "pending";
  invited_by: string | null;
  invited_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email?: string;
    avatar_url?: string;
  };
}

export function useTeamMembers() {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ["team-members", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const { data: members, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("organization_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!members) return [];

      // Buscar profiles separadamente
      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      // Combinar dados
      const result = members.map(member => ({
        ...member,
        profiles: profiles?.find(p => p.id === member.user_id) || { name: "Usuário" },
      }));

      return result as TeamMember[];
    },
  });
}

export function useTeamMembersMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TeamMember> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("team_members")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Membro atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'membro' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Membro removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'membro' }));
    },
  });

  return {
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
