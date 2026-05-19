import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Heart, ArrowRight, Home } from "lucide-react";

const ColaboradorObrigado = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader className="pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-success to-secondary rounded-full flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold mb-4">
            Obrigado pela sua participação! 🎉
          </CardTitle>
          
          <CardDescription className="text-lg">
            Sua contribuição é fundamental para construirmos um ambiente de trabalho mais saudável e acolhedor para todos.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 rounded-lg bg-primary-soft">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Anônima</h3>
              <p className="text-sm text-muted-foreground text-center">
                Suas respostas são completamente confidenciais
              </p>
            </div>

            <div className="flex flex-col items-center p-4 rounded-lg bg-secondary-soft">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-3">
                <ArrowRight className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Ação</h3>
              <p className="text-sm text-muted-foreground text-center">
                Os resultados guiarão melhorias concretas
              </p>
            </div>

            <div className="flex flex-col items-center p-4 rounded-lg bg-accent-soft">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Transparência</h3>
              <p className="text-sm text-muted-foreground text-center">
                Resultados compartilhados com toda equipe
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-subtle rounded-lg border">
            <h3 className="font-semibold mb-3">📊 Próximos Passos</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Analisaremos todas as respostas nos próximos dias</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Compartilharemos os resultados gerais com toda a equipe</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Desenvolveremos um plano de ação baseado nos insights</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Você receberá atualizações sobre as melhorias implementadas</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Dúvidas ou sugestões?</strong><br />
              Entre em contato com o RH pelo e-mail: <strong>rh@empresa.com</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="flex items-center space-x-2"
              >
                <span>Fechar Janela</span>
              </Button>
              
              <Button 
                onClick={() => navigate("/")}
                variant="bright"
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Ir para Home</span>
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-6 border-t">
            <p>
              💚 Muito obrigado por dedicar seu tempo para tornar nossa empresa um lugar melhor para trabalhar!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColaboradorObrigado;