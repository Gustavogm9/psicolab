import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { Questao } from "./QuestaoEditor";

interface TemplateSelectorProps {
  onSelectTemplate: (questoes: Questao[]) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const { data: templates, isLoading } = useTemplates();

  const aplicarTemplate = (template: any) => {
    const questoes: Questao[] = template.questoes.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      pergunta: q.pergunta,
      tipo: q.tipo,
      opcoes: q.opcoes,
      obrigatoria: q.obrigatoria ?? true,
      categoria: q.categoria || "Geral",
      peso: q.peso || 5,
      ordem: q.ordem ?? index + 1,
    }));

    onSelectTemplate(questoes);
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando templates...</div>;
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum template disponível</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold">{template.nome}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.descricao}
              </p>
            </div>
            <Badge variant="secondary">{template.categoria}</Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{template.numero_questoes || 0} questões</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.tempo_estimado || 0} min</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => aplicarTemplate(template)}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Usar Template
          </Button>
        </Card>
      ))}
    </div>
  );
};
