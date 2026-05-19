import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SortableSecaoItemProps {
  secao: {
    id: string;
    nome: string;
    visivel: boolean;
    ordem: number;
  };
  onToggleVisibility: (id: string) => void;
  temConteudo?: boolean;
  avisoConteudo?: string;
}

export function SortableSecaoItem({ secao, onToggleVisibility, temConteudo = true, avisoConteudo }: SortableSecaoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: secao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determinar se deve mostrar aviso (ativa mas sem conteúdo)
  const mostrarAviso = secao.visivel && !temConteudo;

  // Determinar texto do subtítulo
  const getSubtitulo = () => {
    if (!secao.visivel) return 'Oculta';
    if (!temConteudo) return 'Sem conteúdo - não aparecerá';
    return 'Visível na página';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? 'shadow-lg' : ''} ${mostrarAviso ? 'border-amber-300 bg-amber-50/50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{secao.nome}</h4>
            {mostrarAviso && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{avisoConteudo || 'Esta seção está ativa mas não será exibida pois não há conteúdo cadastrado.'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className={`text-sm ${mostrarAviso ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {getSubtitulo()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {secao.visivel ? (
            temConteudo ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Switch
            checked={secao.visivel}
            onCheckedChange={() => onToggleVisibility(secao.id)}
          />
        </div>
      </div>
    </Card>
  );
}
