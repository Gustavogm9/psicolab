import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Calendar,
  BookOpen,
  Briefcase,
  Shield,
  CreditCard,
  User,
  ChevronRight,
  Brain,
  UserPlus,
  Building2,
  Globe,
  Palette,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useClientes } from "@/hooks/useClientes";
import { useEventosHoje } from "@/hooks/useEventos";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  userType: "consultora" | "gestor" | "admin";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { config } = useWhiteLabel();
  const [isAdmin, setIsAdmin] = useState(false);
  const { effectiveUserId } = useAuth();
  
  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  // Buscar clientes para mostrar contagem no badge
  const { data: clientes = [] } = useClientes();
  const totalClientes = clientes.length;
  
  // Buscar eventos de hoje para mostrar badge
  const { data: eventosHoje = 0 } = useEventosHoje();

  // Buscar faturas atrasadas para badge
  const { data: faturasAtrasadas = 0 } = useQuery({
    queryKey: ['faturas-atrasadas-count', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return 0;
      const { count } = await supabase
        .from('faturas')
        .select('*', { count: 'exact', head: true })
        .eq('consultora_id', effectiveUserId)
        .eq('status', 'atrasado');
      return count || 0;
    },
    enabled: !!effectiveUserId,
  });

  const displayName = config?.nome_empresa || "MenteMetrics";
  const displayLogo = config?.logo_url;

  // Verificar se usuário é admin
  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, []);

  // Navigation items for Admin
  const adminNavigation = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard/admin#overview",
      badge: null,
    },
    {
      title: "Gestão de Domínios",
      icon: Globe,
      url: "/dashboard/admin#dominios",
    },
    {
      title: "Perfis Públicos",
      icon: Users,
      url: "/dashboard/admin#perfis",
    },
    {
      title: "White-Label",
      icon: Palette,
      url: "/dashboard/admin#whitelabel",
    },
    {
      title: "Analytics Consolidado",
      icon: BarChart3,
      url: "/dashboard/admin#analytics",
    },
    {
      title: "Logs de Auditoria",
      icon: Shield,
      url: "/dashboard/admin#audit-logs",
    },
  ];

  // Navigation items for Consultora
  const consultoraNavigation = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard/consultora",
      badge: null,
    },
    {
      title: "Central de Feedback",
      icon: BarChart3,
      url: "/feedback-hub",
    },
    {
      title: "Avaliações Internas",
      icon: ClipboardList,
      items: [
        { title: "Todas as Avaliações", url: "/avaliacoes" },
        { title: "Criar Avaliação", url: "/avaliacoes/criar" },
        { title: "Templates", url: "/avaliacoes/templates" },
      ],
    },
    {
      title: "Captação de Leads",
      icon: TrendingUp,
      items: [
        { title: "Meus Questionários", url: "/diagnosticos" },
        { title: "Criar Questionário", url: "/diagnosticos/criar" },
      ],
    },
    {
      title: "CRM",
      icon: UserPlus,
      url: "/crm",
    },
    {
      title: "Agenda",
      icon: Calendar,
      url: "/agenda",
      badge: eventosHoje > 0 ? String(eventosHoje) : null,
    },
    {
      title: "Relatórios",
      icon: FileText,
      url: "/relatorios",
    },
    {
      title: "Intervenções",
      icon: Briefcase,
      url: "/intervencoes",
    },
    {
      title: "Clientes",
      icon: Users,
      url: "/clientes",
      badge: totalClientes > 0 ? String(totalClientes) : null,
    },
    {
      title: "Financeiro",
      icon: CreditCard,
      url: "/financeiro",
      badge: faturasAtrasadas > 0 ? String(faturasAtrasadas) : null,
      badgeVariant: faturasAtrasadas > 0 ? "destructive" : "secondary",
    },
  ];

  // Navigation items for Gestor
  const gestorNavigation = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard/gestor",
      badge: null,
    },
    {
      title: "Avaliações",
      icon: ClipboardList,
      items: [
        { title: "Minhas Avaliações", url: "/avaliacoes" },
        { title: "Histórico", url: "/avaliacoes/historico" },
      ],
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      items: [
        { title: "Dashboard Executivo", url: "/relatorios" },
        { title: "Análises Comparativas", url: "/analises" },
        { title: "KPIs", url: "/relatorios/kpis" },
      ],
    },
    {
      title: "Equipe",
      icon: Users,
      url: "/equipe",
    },
  ];

  // Settings items (common for both)
  const commonNavigation = [
    {
      title: "Configurações",
      icon: Settings,
      items: [
        { title: "Meu Perfil", url: "/meu-perfil", icon: User },
        ...(userType !== "admin" ? [
          { title: "Minha Empresa", url: "/minha-empresa", icon: Building2 },
          { title: "Manual de Marca", url: "/configuracoes/marca", icon: Palette },
        ] : []),
        ...(userType === "consultora" ? [{ title: "Página Pública", url: "/perfil-publico/configurar", icon: Globe }] : []),
        
      ],
    },
  ];

  // Admin sub-navigation (only visible for admins)
  const adminSubNavigation = [
    {
      title: "Domínios",
      icon: Globe,
      url: "/admin/dominios",
    },
    {
      title: "Perfis Públicos",
      icon: User,
      url: "/admin/perfis-publicos",
    },
    {
      title: "White-Label",
      icon: Palette,
      url: "/admin/whitelabel",
    },
    {
      title: "Analytics Global",
      icon: BarChart3,
      url: "/admin/analytics",
    },
  ];

  const navigation = userType === "admin" ? adminNavigation : userType === "consultora" ? consultoraNavigation : gestorNavigation;

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          {displayLogo ? (
            <img 
              src={displayLogo} 
              alt={displayName}
              className="w-8 h-8 object-contain rounded-lg"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="font-bold text-lg text-gradient">{displayName}</h1>
              <p className="text-xs text-muted-foreground">
                {userType === "admin" ? "Administrador" : userType === "consultora" ? "Consultora" : "Gestor Cliente"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible 
                      defaultOpen={item.items.some((subItem) => isActive(subItem.url))}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>
                          {!isCollapsed && (
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild 
                                className={isActive(subItem.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                              >
                                <NavLink to={subItem.url}>
                                  {!isCollapsed && <span>{subItem.title}</span>}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      className={isActive(item.url || "") ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <NavLink 
                        to={item.url || ""} 
                        state={(item as any).state}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {item.badge && !isCollapsed && (
                          <Badge variant={((item as any).badgeVariant as any) || "secondary"} className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <Separator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild 
                              className={isActive(subItem.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                            >
                              <NavLink to={subItem.url}>
                                {!isCollapsed && <span>{subItem.title}</span>}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}