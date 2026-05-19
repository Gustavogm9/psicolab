import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestaoEditor, Questao } from "./QuestaoEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestoesManagerProps {
  questoes: Questao[];
  onChange: (questoes: Questao[]) => void;
}

const SortableQuestao = ({ questao, onChange, onRemove }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: questao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Validação visual da questão
  const isQuestaoValida = () => {
    if (!questao.pergunta?.trim()) return false;
    if (!questao.categoria) return false;
    if (!questao.peso || questao.peso < 1 || questao.peso > 10) return false;
    
    if (questao.tipo === 'multipla_escolha') {
      const opcoesValidas = questao.opcoes?.filter((op: string) => op.trim() !== '') || [];
      if (opcoesValidas.length < 2) return false;
    }
    
    return true;
  };

  const valida = isQuestaoValida();

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Indicador visual de validação */}
      <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full ${
        valida ? 'bg-green-500' : 'bg-yellow-500'
      }`} />
      
      <QuestaoEditor
        questao={questao}
        onChange={onChange}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const QuestoesManager = ({ questoes, onChange }: QuestoesManagerProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addQuestao = () => {
    const novaQuestao: Questao = {
      id: `q-${Date.now()}`,
      pergunta: "",
      tipo: "escala",
      obrigatoria: true,
      categoria: "Carga de Trabalho",
      peso: 5,
      ordem: questoes.length,
    };
    onChange([...questoes, novaQuestao]);
  };

  const removeQuestao = (id: string) => {
    onChange(questoes.filter(q => q.id !== id));
  };

  const updateQuestao = (id: string, questaoAtualizada: Questao) => {
    onChange(questoes.map(q => q.id === id ? questaoAtualizada : q));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questoes.findIndex(q => q.id === active.id);
      const newIndex = questoes.findIndex(q => q.id === over.id);
      
      const reordered = arrayMove(questoes, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        ordem: idx
      }));
      
      onChange(reordered);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questoes.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questoes.map((questao) => (
              <SortableQuestao
                key={questao.id}
                questao={questao}
                onChange={(q: Questao) => updateQuestao(questao.id, q)}
                onRemove={() => removeQuestao(questao.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={addQuestao}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Questão
      </Button>

      {questoes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma questão adicionada. Clique no botão acima para começar.
        </div>
      )}
    </div>
  );
};
