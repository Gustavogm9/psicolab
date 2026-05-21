import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Building2, Mail, DollarSign, TrendingUp, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CSS } from '@dnd-kit/utilities';

interface Oportunidade {
  id: string;
  titulo: string;
  estagio: string;
  valor_estimado?: number;
  probabilidade?: number;
  data_fechamento_prevista?: string;
  lead: {
    id: string;
    nome: string;
    email: string;
    empresa?: string;
    score: number;
  };
  tags?: string[];
}

interface KanbanBoardProps {
  oportunidades: Oportunidade[];
  onEstagioChange: (oportunidadeId: string, newEstagio: string) => void;
  onOportunidadeClick: (oportunidade: Oportunidade) => void;
  pendingMoves?: Set<string>;
}

const columns = [
  { id: 'prospecção', label: 'Prospecção', color: 'bg-blue-500' },
  { id: 'qualificação', label: 'Qualificação', color: 'bg-yellow-500' },
  { id: 'proposta', label: 'Proposta', color: 'bg-purple-500' },
  { id: 'negociação', label: 'Negociação', color: 'bg-orange-500' },
  { id: 'fechamento', label: 'Fechamento', color: 'bg-indigo-500' },
  { id: 'ganho', label: 'Ganho', color: 'bg-green-500' },
  { id: 'perdido', label: 'Perdido', color: 'bg-red-500' },
];

function OportunidadeCard({ 
  oportunidade, 
  onClick,
  isPending = false 
}: { 
  oportunidade: Oportunidade; 
  onClick: () => void;
  isPending?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oportunidade.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getProbabilidadeColor = (probabilidade?: number) => {
    if (!probabilidade) return 'secondary';
    if (probabilidade >= 70) return 'default';
    if (probabilidade >= 40) return 'outline';
    return 'destructive';
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 relative">
      <Card className={`hover:shadow-md transition-shadow ${isPending ? 'opacity-60' : ''}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 cursor-pointer" onClick={onClick}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm line-clamp-1">{oportunidade.titulo}</h4>
                {oportunidade.probabilidade !== undefined && (
                  <Badge variant={getProbabilidadeColor(oportunidade.probabilidade)} className="text-xs">
                    {oportunidade.probabilidade}%
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span className="line-clamp-1 font-medium">{oportunidade.lead.nome}</span>
                </div>
                
                {oportunidade.lead.empresa && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="line-clamp-1">{oportunidade.lead.empresa}</span>
                  </div>
                )}
                
                {oportunidade.lead.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="line-clamp-1">{oportunidade.lead.email}</span>
                  </div>
                )}
                
                {!oportunidade.lead.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">Sem email</Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    Score: {oportunidade.lead.score}
                  </Badge>
                  
                  {oportunidade.valor_estimado && oportunidade.valor_estimado > 0 && (
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      R$ {oportunidade.valor_estimado.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                
                {oportunidade.data_fechamento_prevista && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {format(new Date(oportunidade.data_fechamento_prevista), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                
                {oportunidade.tags && oportunidade.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap pt-1">
                    {oportunidade.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Overlay de loading */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            Movendo...
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ 
  column, 
  oportunidades, 
  onOportunidadeClick,
  pendingMoves 
}: { 
  column: typeof columns[0]; 
  oportunidades: Oportunidade[]; 
  onOportunidadeClick: (oportunidade: Oportunidade) => void;
  pendingMoves?: Set<string>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div ref={setNodeRef} className="flex flex-col">
      <Card className={`flex-1 transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {column.label}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {oportunidades.length}
            </Badge>
          </div>
          <div className={`h-1 w-full rounded-full ${column.color} mt-2`} />
        </CardHeader>
        
        <CardContent className="pt-0">
          <SortableContext
            items={oportunidades.map(o => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[500px]">
              {oportunidades.map(oportunidade => (
                <OportunidadeCard
                  key={oportunidade.id}
                  oportunidade={oportunidade}
                  onClick={() => onOportunidadeClick(oportunidade)}
                  isPending={pendingMoves?.has(oportunidade.id)}
                />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanBoard({ oportunidades, onEstagioChange, onOportunidadeClick, pendingMoves }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const oportunidadeId = active.id as string;
      let newEstagio = over.id as string;
      
      // Se não for uma coluna direta, mas for o ID de outra oportunidade,
      // pegamos o estágio da oportunidade sobre a qual dropamos
      if (!columns.some(col => col.id === newEstagio)) {
        const targetOportunidade = oportunidades.find(o => o.id === newEstagio);
        if (targetOportunidade) {
          newEstagio = targetOportunidade.estagio;
        }
      }
      
      // Verificar se é uma coluna válida
      if (columns.some(col => col.id === newEstagio)) {
        const oportunidade = oportunidades.find(o => o.id === oportunidadeId);
        // Só atualizar se mudou de estágio
        if (oportunidade && oportunidade.estagio !== newEstagio) {
          onEstagioChange(oportunidadeId, newEstagio);
        }
      }
    }
    
    setActiveId(null);
  };

  const getOportunidadesByEstagio = (estagio: string) => {
    return oportunidades.filter(oportunidade => oportunidade.estagio === estagio);
  };

  const activeOportunidade = activeId ? oportunidades.find(o => o.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-1 min-w-max">
          {columns.map(column => {
            const columnOportunidades = getOportunidadesByEstagio(column.id);
            
            return (
              <div key={column.id} className="w-80 flex-shrink-0">
                <KanbanColumn
                  column={column}
                  oportunidades={columnOportunidades}
                  onOportunidadeClick={onOportunidadeClick}
                  pendingMoves={pendingMoves}
                />
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <DragOverlay>
        {activeOportunidade ? (
          <Card className="w-64 opacity-90 rotate-3">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm">{activeOportunidade.titulo}</h4>
              <p className="text-xs text-muted-foreground">{activeOportunidade.lead.nome}</p>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
