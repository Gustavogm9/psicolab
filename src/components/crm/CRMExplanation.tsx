import { useState, useEffect } from "react";
import { Users, Target, Building, ArrowRight, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CRMExplanation() {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('crm_explanation_collapsed');
    return saved === null ? true : saved === 'false';
  });

  useEffect(() => {
    localStorage.setItem('crm_explanation_collapsed', String(!isOpen));
  }, [isOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <div className="border rounded-lg border-primary/20 bg-primary/5 p-4">
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Como funciona o CRM?</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-4">
            {/* Layout Mobile - Vertical */}
            <div className="flex flex-col gap-3 md:hidden">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Lead</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contato ou empresa em potencial. Exemplo: João Silva da Empresa XYZ.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center justify-center gap-1 py-2">
                <ArrowDown className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-primary">cria</span>
              </div>

              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Oportunidade</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Negócio específico com um Lead. Um Lead pode ter várias oportunidades ativas.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center justify-center gap-1 py-2">
                <ArrowDown className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-primary">converte em</span>
              </div>

              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Cliente</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lead convertido após ganhar uma oportunidade. Passa a ter projetos ativos.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Nota sobre migração */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>✨ Ao converter:</strong> As oportunidades são migradas automaticamente para o cliente e passam a ser gerenciadas na página dele.
              </p>
            </div>

            {/* Layout Desktop - Horizontal */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Lead</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contato ou empresa em potencial. Exemplo: João Silva da Empresa XYZ.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center justify-center gap-1">
                <ArrowRight className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-primary">cria</span>
              </div>

              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Oportunidade</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Negócio específico com um Lead. Um Lead pode ter várias oportunidades ativas.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center justify-center gap-1">
                <ArrowRight className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-primary">converte em</span>
              </div>

              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Cliente</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lead convertido após ganhar uma oportunidade. Passa a ter projetos ativos.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Nota sobre migração - Desktop */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>✨ Ao converter:</strong> As oportunidades são migradas automaticamente para o cliente e passam a ser gerenciadas na página dele.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
