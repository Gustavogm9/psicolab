import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContrastColor } from '@/lib/color-utils';

interface DiagnosticoWidgetProps {
  questionario: {
    id: string;
    titulo: string;
    descricao?: string;
    slug: string;
    tempo_estimado?: number;
    total_questoes?: number;
  };
  corPrimaria?: string;
  onClique?: () => void;
}

export const DiagnosticoWidget = ({ questionario, corPrimaria, onClique }: DiagnosticoWidgetProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClique) onClique();
    navigate(`/diagnostico/${questionario.slug}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2" style={{ borderColor: corPrimaria }}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${corPrimaria}20` }}
          >
            <ClipboardList className="h-6 w-6" style={{ color: corPrimaria }} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{questionario.titulo}</CardTitle>
            {questionario.descricao && (
              <CardDescription className="text-base">
                {questionario.descricao}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
          {questionario.tempo_estimado && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{questionario.tempo_estimado} min</span>
            </div>
          )}
          {questionario.total_questoes && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{questionario.total_questoes} questões</span>
            </div>
          )}
        </div>
        <Button 
          onClick={handleClick}
          className="w-full group hover:brightness-90 transition-all duration-300"
          style={{ backgroundColor: corPrimaria, color: getContrastColor(corPrimaria || '#000000') }}
        >
          Fazer Avaliação Gratuita
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};
