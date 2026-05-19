import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "consultora" | "gestor" | "admin";

interface Profile {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  cargo: string | null;
  bio: string | null;
  crp: string | null;
  area_atuacao: string | null;
  anos_experiencia: number | null;
  avatar_url: string | null;
  empresa_setor: string | null;
  empresa_tamanho: string | null;
  empresa_endereco: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isLoading: boolean;
  // Impersonificação
  impersonatedUserId: string | null;
  impersonatedProfile: Profile | null;
  impersonatedUserRole: UserRole | null;
  isImpersonating: boolean;
  effectiveUserId: string | null;
  effectiveUserRole: UserRole | null;
  effectiveProfile: Profile | null;
  effectiveEmail: string | null;
  startImpersonation: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  stopImpersonation: () => Promise<void>;
  // Autenticação
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshImpersonatedProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado de impersonificação
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [impersonatedProfile, setImpersonatedProfile] = useState<Profile | null>(null);
  const [impersonatedUserRole, setImpersonatedUserRole] = useState<UserRole | null>(null);
  const [impersonatedEmail, setImpersonatedEmail] = useState<string | null>(null);
  const [impersonationStartTime, setImpersonationStartTime] = useState<number | null>(null);
  
  // Timeout de 1 hora para impersonificação
  const IMPERSONATION_TIMEOUT_MS = 60 * 60 * 1000;
  
  // Computar ID efetivo, role efetiva, perfil efetivo e flag de impersonificação
  const isImpersonating = !!impersonatedUserId;
  const effectiveUserId = impersonatedUserId || user?.id || null;
  const effectiveUserRole = isImpersonating ? impersonatedUserRole : userRole;
  const effectiveProfile = isImpersonating ? impersonatedProfile : profile;
  const effectiveEmail = isImpersonating ? impersonatedEmail : user?.email || null;

  // Carregar perfil e role do usuário
  const loadUserData = async (userId: string) => {
    try {
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Se perfil não existe ainda, aguardar e tentar novamente
      if (!profileData) {
        console.log("Perfil não encontrado, aguardando criação...");
        // Aguardar 500ms e tentar novamente (o trigger pode estar criando)
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: retryProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        setProfile(retryProfile);
      } else {
        setProfile(profileData);
      }

      // Carregar TODAS as roles do usuário
      const { data: rolesData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Se não tiver roles, usar gestor como padrão
      if (!rolesData || rolesData.length === 0) {
        setUserRole("gestor");
        return;
      }

      // Definir prioridade de roles: admin > gestor > consultora
      const rolePriority: Record<UserRole, number> = {
        admin: 3,
        gestor: 2,
        consultora: 1
      };

      // Pegar a role de maior prioridade
      const highestRole = rolesData
        .map(r => r.role as UserRole)
        .sort((a, b) => rolePriority[b] - rolePriority[a])[0];

      setUserRole(highestRole);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      // Fallback para não bloquear o login
      setUserRole("gestor");
    }
  };

  // Monitorar mudanças de autenticação
  useEffect(() => {
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Carregar dados do usuário quando autenticado
        if (currentSession?.user) {
          setTimeout(() => {
            loadUserData(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        loadUserData(currentSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Timeout automático de impersonificação
  useEffect(() => {
    if (!isImpersonating || !impersonationStartTime) return;

    const checkTimeout = () => {
      const elapsed = Date.now() - impersonationStartTime;
      if (elapsed >= IMPERSONATION_TIMEOUT_MS) {
        toast.error("Sessão de impersonificação expirada", {
          description: "A sessão expirou após 1 hora. Você foi retornado à sua conta de administrador.",
        });
        stopImpersonation();
      }
    };

    // Verificar a cada minuto
    const interval = setInterval(checkTimeout, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isImpersonating, impersonationStartTime]);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Erro no signup:", error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Erro no login:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      const targetUserId = effectiveUserId;
      if (!targetUserId) throw new Error("Usuário não identificado");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", targetUserId);

      if (error) throw error;

      // Recarregar o perfil correto
      if (isImpersonating && impersonatedUserId) {
        // Recarregar perfil impersonificado
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", impersonatedUserId)
          .maybeSingle();
        if (updatedProfile) setImpersonatedProfile(updatedProfile);
      } else if (user) {
        // Recarregar perfil do admin
        await loadUserData(user.id);
      }
      
      return { error: null };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { error: error as Error };
    }
  };

  const refreshImpersonatedProfile = (profile: Profile) => {
    if (isImpersonating) {
      setImpersonatedProfile(profile);
    }
  };

  // Iniciar impersonificação
  const startImpersonation = async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Validar se pode impersonar (server-side)
      const { data: canImpersonate, error: validateError } = await supabase
        .rpc("can_impersonate", {
          admin_user_id: user.id,
          target_user_id: targetUserId
        });

      if (validateError || !canImpersonate) {
        const errorMsg = validateError?.message || "Você não tem permissão para impersonificar este usuário";
        return { success: false, error: errorMsg };
      }

      // Buscar dados completos do usuário (incluindo email)
      const { data: targetUserData, error: userDataError } = await supabase
        .rpc("get_users_for_impersonation")
        .eq("id", targetUserId)
        .maybeSingle();

      if (userDataError || !targetUserData) {
        console.error("Erro ao buscar dados do usuário:", userDataError);
        return { success: false, error: "Dados do usuário não encontrados" };
      }

      // Carregar perfil do target
      const { data: targetProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();

      if (profileError || !targetProfile) {
        return { success: false, error: "Perfil do usuário não encontrado" };
      }

      // Carregar role do target
      const { data: targetRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId);

      if (roleError) {
        console.error("Erro ao carregar role do target:", roleError);
      }

      const targetRole = targetRoles?.[0]?.role as UserRole || "gestor";

      // Registrar log de início
      await supabase.from("admin_impersonation_logs").insert({
        admin_id: user.id,
        target_user_id: targetUserId,
        action_type: "start",
        action_details: { target_name: targetProfile.name, target_role: targetRole }
      });

      // Atualizar estado
      setImpersonatedUserId(targetUserId);
      setImpersonatedProfile(targetProfile);
      setImpersonatedUserRole(targetRole);
      setImpersonatedEmail(targetUserData.email);
      setImpersonationStartTime(Date.now());

      toast.success(`Agora você está agindo como ${targetProfile.name}`, {
        description: "Sessão expira em 1 hora."
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao iniciar impersonificação:", error);
      return { success: false, error: "Erro ao iniciar impersonificação" };
    }
  };

  // Encerrar impersonificação
  const stopImpersonation = async () => {
    try {
      if (!user || !impersonatedUserId) return;

      // Registrar log de fim
      await supabase.from("admin_impersonation_logs").insert({
        admin_id: user.id,
        target_user_id: impersonatedUserId,
        action_type: "end",
        action_details: {}
      });

      // Limpar estado
    setImpersonatedUserId(null);
    setImpersonatedProfile(null);
    setImpersonatedUserRole(null);
    setImpersonatedEmail(null);
    setImpersonationStartTime(null);

      toast.info("Impersonificação encerrada");
    } catch (error) {
      console.error("Erro ao encerrar impersonificação:", error);
      toast.error("Erro ao encerrar impersonificação");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      userRole,
      isLoading,
      // Impersonificação
      impersonatedUserId,
      impersonatedProfile,
      impersonatedUserRole,
      isImpersonating,
      effectiveUserId,
      effectiveUserRole,
      effectiveProfile,
      effectiveEmail,
      startImpersonation,
      stopImpersonation,
      // Autenticação
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshImpersonatedProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
