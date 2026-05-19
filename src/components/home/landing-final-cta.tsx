import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingFinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold">
              Pronto para profissionalizar sua atuação com empresas?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Comece hoje a captar mais clientes, entregar diagnósticos profissionais e comprovar o valor do seu trabalho
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="space-y-2 animate-fade-in animation-delay-200">
              <div className="text-4xl font-bold">Página</div>
              <p className="text-sm text-primary-foreground/80">Profissional com domínio próprio</p>
            </div>
            <div className="space-y-2 animate-fade-in animation-delay-300">
              <div className="text-4xl font-bold">CRM</div>
              <p className="text-sm text-primary-foreground/80">Integrado do lead ao cliente</p>
            </div>
            <div className="space-y-2 animate-fade-in animation-delay-400">
              <div className="text-4xl font-bold">ROI</div>
              <p className="text-sm text-primary-foreground/80">Automático que comprova resultados</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in animation-delay-500">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-base h-14 px-8 font-semibold"
              asChild
            >
              <Link to="/login">
                Criar minha conta grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base h-14 px-8 font-semibold bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar conversa
              </a>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/70 pt-4">
            Comece hoje mesmo • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
