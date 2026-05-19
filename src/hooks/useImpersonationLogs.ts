import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ImpersonationLog {
  id: string;
  admin_id: string;
  target_user_id: string;
  action_type: string;
  action_details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_name?: string;
  target_name?: string;
}

interface UseImpersonationLogsParams {
  adminId?: string;
  targetUserId?: string;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export function useImpersonationLogs({
  adminId,
  targetUserId,
  actionType,
  startDate,
  endDate,
  page = 1,
  pageSize = 50,
}: UseImpersonationLogsParams = {}) {
  return useQuery({
    queryKey: [
      "impersonation-logs",
      adminId,
      targetUserId,
      actionType,
      startDate,
      endDate,
      page,
      pageSize,
    ],
    queryFn: async () => {
      let query = supabase
        .from("admin_impersonation_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (adminId) {
        query = query.eq("admin_id", adminId);
      }

      if (targetUserId) {
        query = query.eq("target_user_id", targetUserId);
      }

      if (actionType && actionType !== "all") {
        query = query.eq("action_type", actionType);
      }

      if (startDate) {
        query = query.gte("created_at", format(startDate, "yyyy-MM-dd"));
      }

      if (endDate) {
        query = query.lte("created_at", format(endDate, "yyyy-MM-dd"));
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: logsData, error: logsError, count } = await query;

      if (logsError) throw logsError;

      // Buscar nomes dos usuários
      if (logsData && logsData.length > 0) {
        const adminIds = [...new Set(logsData.map((log) => log.admin_id))];
        const targetIds = [...new Set(logsData.map((log) => log.target_user_id))];
        const allIds = [...new Set([...adminIds, ...targetIds])];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", allIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p.name])
        );

        const enrichedLogs = logsData.map((log) => ({
          ...log,
          admin_name: profileMap.get(log.admin_id) || "Admin",
          target_name: profileMap.get(log.target_user_id) || "Usuário",
        }));

        return {
          logs: enrichedLogs as ImpersonationLog[],
          total: count || 0,
          pages: Math.ceil((count || 0) / pageSize),
        };
      }

      return {
        logs: [] as ImpersonationLog[],
        total: 0,
        pages: 0,
      };
    },
  });
}

// Hook auxiliar para buscar lista de admins (para filtro)
export function useAdminList() {
  return useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (error) throw error;

      const userIds = data.map((item) => item.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      return (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.name || "Admin",
      }));
    },
  });
}

// Hook auxiliar para buscar lista de psicólogos (para filtro)
export function usePsychologistList() {
  return useQuery({
    queryKey: ["psychologist-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .order("name");

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        name: p.name || "Usuário",
      }));
    },
  });
}
