import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Clock,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface HistoricoItem {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  created_at: string;
}

interface LeadTimelineProps {
  historico: HistoricoItem[];
}

const tipoIcons = {
  criado: UserPlus,
  status_alterado: ArrowRight,
  contato_telefone: Phone,
  contato_email: Mail,
  anotacao_adicionada: MessageSquare,
  convertido: CheckCircle,
  follow_up: Clock,
  default: AlertCircle,
};

const tipoColors = {
  criado: 'bg-blue-500',
  status_alterado: 'bg-yellow-500',
  contato_telefone: 'bg-green-500',
  contato_email: 'bg-purple-500',
  anotacao_adicionada: 'bg-indigo-500',
  convertido: 'bg-emerald-500',
  follow_up: 'bg-orange-500',
  default: 'bg-gray-500',
};

export function LeadTimeline({ historico }: LeadTimelineProps) {
  const sortedHistorico = [...historico].sort((a, b) => 
    new Date(b.data || b.created_at).getTime() - new Date(a.data || a.created_at).getTime()
  );

  const getIcon = (tipo: string) => {
    const Icon = tipoIcons[tipo as keyof typeof tipoIcons] || tipoIcons.default;
    return Icon;
  };

  const getColor = (tipo: string) => {
    return tipoColors[tipo as keyof typeof tipoColors] || tipoColors.default;
  };

  if (sortedHistorico.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum evento registrado ainda</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Linha vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {sortedHistorico.map((item, index) => {
        const Icon = getIcon(item.tipo);
        const colorClass = getColor(item.tipo);
        const dateObj = new Date(item.data || item.created_at);
        
        return (
          <Card key={item.id} className="relative ml-14">
            {/* Ícone na timeline */}
            <div className={`absolute -left-[3.25rem] top-4 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center z-10`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {item.tipo.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-sm font-medium mb-1">{item.descricao}</p>
                  <time className="text-xs text-muted-foreground">
                    {format(dateObj, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </time>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
