import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { ThemeInjector } from "./ThemeInjector";

interface MainLayoutProps {
  children: ReactNode;
  // Optional overrides - if not provided, uses context
  userType?: "consultora" | "gestor" | "admin";
  userName?: string;
  companyName?: string;
}

export function MainLayout({ children, userType, userName, companyName }: MainLayoutProps) {
  const location = useLocation();
  const { profile, userRole, isImpersonating, effectiveUserRole, impersonatedProfile } = useAuth();
  
  // Use context data if no props provided
  const actualUserType = userType || effectiveUserRole || "gestor";
  const actualUserName = userName || (isImpersonating ? impersonatedProfile?.name : profile?.name) || "Usuário";
  const actualCompanyName = companyName || (isImpersonating ? impersonatedProfile?.company : profile?.company);
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      '': 'Dashboard',
      'avaliacoes': 'Avaliações',
      'criar': 'Criar Avaliação',
      'editar': 'Editar Avaliação',
      'relatorios': 'Relatórios',
      'detalhado': 'Detalhado',
      'analises': 'Análises',
      'intervencoes': 'Intervenções',
      'clientes': 'Clientes',
      'equipe': 'Equipe',
      'perfil': 'Perfil',
      'configuracoes': 'Configurações',
      'configuracoes-avancadas': 'Configurações Avançadas',
      'billing': 'Planos e Cobrança',
      'help-center': 'Central de Ajuda',
      'sobre': 'Sobre',
      'templates': 'Templates',
      'historico': 'Histórico',
      'kpis': 'KPIs',
      'financeiro': 'Gestão Financeira'
    };

    if (segments.length === 0) {
      return [{ title: 'Dashboard', url: '/', isLast: true }];
    }

    const breadcrumbs = [{ title: 'Dashboard', url: '/', isLast: false }];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const title = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        title,
        url: currentPath,
        isLast: index === segments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <ThemeInjector />
      <ImpersonationBanner />
      <div className="min-h-screen flex w-full">
        <AppSidebar userType={actualUserType} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              
              {/* Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={breadcrumb.url}>
                      <BreadcrumbItem>
                        {breadcrumb.isLast ? (
                          <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                         ) : (
                          <BreadcrumbLink href={breadcrumb.url}>
                            {breadcrumb.title}
                          </BreadcrumbLink>
                         )}
                      </BreadcrumbItem>
                       {!breadcrumb.isLast && <BreadcrumbSeparator />}
                     </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Right side of header */}
              <Navbar 
                userType={actualUserType}
                userName={actualUserName}
                companyName={actualCompanyName}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}