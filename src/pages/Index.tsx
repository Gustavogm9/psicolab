import { LandingNavbar } from "@/components/home/landing-navbar";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingStats } from "@/components/home/landing-stats";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingBenefits } from "@/components/home/landing-benefits";
import { LandingFeatures } from "@/components/home/landing-features";
import { LandingForCompanies } from "@/components/home/landing-for-companies";
import { LandingUseCases } from "@/components/home/landing-use-cases";
import { LandingFAQ } from "@/components/home/landing-faq";
import { LandingFinalCTA } from "@/components/home/landing-final-cta";
import { LandingFooter } from "@/components/home/landing-footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { WhiteLabelProvider } from "@/contexts/WhiteLabelContext";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { useActiveDomain } from "@/hooks/useActiveDomain";
import PerfilPublico from "./PerfilPublico";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { data: activeDomain, isLoading: isLoadingDomain } = useActiveDomain();

  // Redirecionar se já estiver autenticado (mas não se for domínio customizado)
  useEffect(() => {
    if (user && userRole && !activeDomain?.isCustomDomain) {
      navigate(`/dashboard/${userRole}`);
    }
  }, [user, userRole, navigate, activeDomain?.isCustomDomain]);

  // Loading enquanto verifica domínio
  if (isLoadingDomain) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se é domínio customizado, mostrar perfil público diretamente
  if (activeDomain?.isCustomDomain && activeDomain?.slug) {
    return <PerfilPublico slug={activeDomain.slug} />;
  }

  return (
    <WhiteLabelProvider>
      <ThemeInjector />
      <div className="min-h-screen bg-background">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingStats />
          <div id="como-funciona"><LandingHowItWorks /></div>
          <LandingBenefits />
          <div id="recursos"><LandingFeatures /></div>
          <div id="para-empresas"><LandingForCompanies /></div>
          <LandingUseCases />
          <div id="faq"><LandingFAQ /></div>
          <LandingFinalCTA />
        </main>
        <LandingFooter />
      </div>
    </WhiteLabelProvider>
  );
};

export default Index;
