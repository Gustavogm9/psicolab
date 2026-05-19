import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import { Loader2 } from "lucide-react";

// ============================================================
// Imports estáticos — pontos de entrada críticos (always loaded)
// ============================================================
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// ============================================================
// Imports lazy — carregados sob demanda (code splitting)
// Cada lazy() gera um chunk separado no build, reduzindo o
// bundle inicial de ~4MB para ~500KB.
// ============================================================

// Onboarding Pages
const CompanySetup = lazy(() => import("./pages/Onboarding/CompanySetup"));
const InitialSetup = lazy(() => import("./pages/Onboarding/InitialSetup"));
const TeamsSetup = lazy(() => import("./pages/Onboarding/TeamsSetup"));

// Avaliações Pages
const Avaliacoes = lazy(() => import("./pages/Avaliacoes"));
const CriarAvaliacao = lazy(() => import("./pages/Avaliacoes/CriarAvaliacao"));
const EditarAvaliacao = lazy(() => import("./pages/Avaliacoes/EditarAvaliacao"));
const PreviewAvaliacao = lazy(() => import("./pages/Avaliacoes/PreviewAvaliacao"));
const RelatorioAvaliacao = lazy(() => import("./pages/Avaliacoes/RelatorioAvaliacao"));
const Templates = lazy(() => import("./pages/Avaliacoes/Templates"));
const CriarTemplate = lazy(() => import("./pages/Avaliacoes/CriarTemplate"));
const EditarTemplate = lazy(() => import("./pages/Avaliacoes/EditarTemplate"));
const Historico = lazy(() => import("./pages/Avaliacoes/Historico"));

// Diagnósticos Pages
const Diagnosticos = lazy(() => import("./pages/Diagnosticos"));
const CriarQuestionario = lazy(() => import("./pages/Diagnosticos/CriarQuestionario"));
const RespostasQuestionarios = lazy(() => import("./pages/Diagnosticos/RespostasQuestionarios"));
const RelatoriosROI = lazy(() => import("./pages/Diagnosticos/RelatoriosROI"));
const EditarQuestionario = lazy(() => import("./pages/Diagnosticos/EditarQuestionario"));

// Avaliações Públicas
const AvaliacaoPublica = lazy(() => import("./pages/Avaliacoes/AvaliacaoPublica"));

// CRM Pages
const CRM = lazy(() => import("./pages/CRM"));
const LeadDetalhes = lazy(() => import("./pages/CRM/LeadDetalhes"));
const Agenda = lazy(() => import("./pages/Agenda"));
const QuestionarioPublico = lazy(() => import("./pages/QuestionarioPublico"));

// Colaborador Pages
const ColaboradorQuestionario = lazy(() => import("./pages/Colaborador/Questionario"));
const ColaboradorObrigado = lazy(() => import("./pages/Colaborador/Obrigado"));

// Relatórios Pages
const Relatorios = lazy(() => import("./pages/Relatorios"));
const RelatorioDetalhado = lazy(() => import("./pages/Relatorios/RelatorioDetalhado"));
const KPIs = lazy(() => import("./pages/Relatorios/KPIs"));

// Gestão Pages
const Intervencoes = lazy(() => import("./pages/Intervencoes"));
const MeuPerfil = lazy(() => import("./pages/MeuPerfil"));
const MinhaEmpresa = lazy(() => import("./pages/MinhaEmpresa"));

// Suporte Pages
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Billing = lazy(() => import("./pages/Billing"));

// Dashboard Pages
const ConsultoraDashboard = lazy(() => import("./pages/Dashboard/ConsultoraDashboard"));
const GestorDashboard = lazy(() => import("./pages/Dashboard/GestorDashboard"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const FeedbackHub = lazy(() => import("./pages/FeedbackHub"));

// Admin Pages
const AuditLogs = lazy(() => import("./pages/Admin/AuditLogs"));

// Páginas Complementares
const Sobre = lazy(() => import("./pages/Sobre"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClienteDetalhes = lazy(() => import("./pages/Clientes/ClienteDetalhes"));
const Equipe = lazy(() => import("./pages/Equipe"));
const LeadCapture = lazy(() => import("./pages/LeadCapture"));
const ROICalculator = lazy(() => import("./pages/ROICalculator"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const AsaasConfig = lazy(() => import("./pages/Financeiro/AsaasConfig"));
const PerfilPublico = lazy(() => import("./pages/PerfilPublico"));
const EnviarDepoimento = lazy(() => import("./pages/PerfilPublico/EnviarDepoimento"));
const ConfiguracoesMarca = lazy(() => import("./pages/ConfiguracoesMarca"));

// Named exports — precisam de wrapper .then() para React.lazy()
const ConfigurarPerfilPublico = lazy(() =>
  import("./pages/ConfigurarPerfilPublico").then((m) => ({ default: m.ConfigurarPerfilPublico }))
);
const Sitemap = lazy(() =>
  import("./pages/Sitemap").then((m) => ({ default: m.Sitemap }))
);

// ============================================================
// Fallback de carregamento — exibido enquanto chunks são baixados
// ============================================================
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/q/:slug" element={<QuestionarioPublico />} />
            <Route path="/avaliacao/:slug" element={<AvaliacaoPublica />} />
            <Route path="/perfil/:slug" element={<PerfilPublico />} />
            <Route path="/perfil/:slug/depoimento" element={<EnviarDepoimento />} />
            <Route path="/lead-capture" element={<LeadCapture />} />
            <Route path="/roi-calculator" element={<ROICalculator />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />
            <Route path="/colaborador/questionario" element={<ColaboradorQuestionario />} />
            <Route path="/colaborador/obrigado" element={<ColaboradorObrigado />} />
            
            {/* Dashboard Routes - Protegidas */}
            <Route path="/dashboard/consultora" element={<ProtectedRoute><ConsultoraDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/gestor" element={<ProtectedRoute><GestorDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/feedback-hub" element={<ProtectedRoute><FeedbackHub /></ProtectedRoute>} />
            
            {/* Onboarding Routes - Protegidas */}
            <Route path="/onboarding/company" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
            <Route path="/onboarding/setup" element={<ProtectedRoute><InitialSetup /></ProtectedRoute>} />
            <Route path="/onboarding/teams" element={<ProtectedRoute><TeamsSetup /></ProtectedRoute>} />
            
            {/* Avaliações Routes - Protegidas */}
            <Route path="/avaliacoes" element={<ProtectedRoute><Avaliacoes /></ProtectedRoute>} />
            <Route path="/avaliacoes/criar" element={<ProtectedRoute><CriarAvaliacao /></ProtectedRoute>} />
            <Route path="/avaliacoes/editar/:id" element={<ProtectedRoute><EditarAvaliacao /></ProtectedRoute>} />
            <Route path="/avaliacoes/preview/:id" element={<ProtectedRoute><PreviewAvaliacao /></ProtectedRoute>} />
            <Route path="/avaliacoes/:id/relatorio" element={<ProtectedRoute><RelatorioAvaliacao /></ProtectedRoute>} />
            <Route path="/avaliacoes/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/avaliacoes/templates/novo" element={<ProtectedRoute><CriarTemplate /></ProtectedRoute>} />
            <Route path="/avaliacoes/templates/:id/editar" element={<ProtectedRoute><EditarTemplate /></ProtectedRoute>} />
            <Route path="/avaliacoes/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />

            {/* Diagnósticos - Protegidas */}
            <Route path="/diagnosticos" element={<ProtectedRoute><Diagnosticos /></ProtectedRoute>} />
            <Route path="/diagnosticos/criar" element={<ProtectedRoute><CriarQuestionario /></ProtectedRoute>} />
            <Route path="/diagnosticos/editar/:id" element={<ProtectedRoute><EditarQuestionario /></ProtectedRoute>} />
            <Route path="/diagnosticos/respostas/:id" element={<ProtectedRoute><RespostasQuestionarios /></ProtectedRoute>} />
            <Route path="/diagnosticos/roi" element={<ProtectedRoute><RelatoriosROI /></ProtectedRoute>} />
            
            {/* CRM - Protegida */}
            <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/crm/:id" element={<ProtectedRoute><LeadDetalhes /></ProtectedRoute>} />
            
            {/* Agenda - Protegida */}
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            
            {/* Relatórios Routes - Protegidas */}
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/relatorios/detalhado" element={<ProtectedRoute><RelatorioDetalhado /></ProtectedRoute>} />
            <Route path="/relatorios/kpis" element={<ProtectedRoute><KPIs /></ProtectedRoute>} />
            
            {/* Gestão Routes - Protegidas */}
            <Route path="/intervencoes" element={<ProtectedRoute><Intervencoes /></ProtectedRoute>} />
            <Route path="/meu-perfil" element={<ProtectedRoute><MeuPerfil /></ProtectedRoute>} />
            <Route path="/minha-empresa" element={<ProtectedRoute><MinhaEmpresa /></ProtectedRoute>} />
            <Route path="/configuracoes/marca" element={<ProtectedRoute><ConfiguracoesMarca /></ProtectedRoute>} />
            
            {/* Clientes e Equipe Routes - Protegidas */}
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/clientes/:id" element={<ProtectedRoute><ClienteDetalhes /></ProtectedRoute>} />
            <Route path="/equipe" element={<ProtectedRoute><Equipe /></ProtectedRoute>} />
            
            {/* Financeiro Routes - Protegidas */}
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/financeiro/asaas" element={<ProtectedRoute><AsaasConfig /></ProtectedRoute>} />
            <Route path="/perfil-publico/configurar" element={<ProtectedRoute><ConfigurarPerfilPublico /></ProtectedRoute>} />
            
            {/* Suporte Routes - Protegidas */}
            <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
