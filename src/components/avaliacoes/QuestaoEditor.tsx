import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus, X, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";

export interface Questao {
  id: string;
  pergunta: string;
  tipo: 'multipla_escolha' | 'escala' | 'texto_livre' | 'sim_nao';
  opcoes?: string[];
  obrigatoria: boolean;
  categoria: string;
  peso: number;
  ordem: number;
}

interface QuestaoEditorProps {
  questao: Questao;
  onChange: (questao: Questao) => void;
  onRemove: () => void;
  dragHandleProps?: any;
}


export const QuestaoEditor = ({ questao, onChange, onRemove, dragHandleProps }: QuestaoEditorProps) => {
  const addOpcao = () => {
    const novasOpcoes = [...(questao.opcoes || []), ""];
    onChange({ ...questao, opcoes: novasOpcoes });
  };

  const removeOpcao = (index: number) => {
    const novasOpcoes = questao.opcoes?.filter((_, i) => i !== index) || [];
    onChange({ ...questao, opcoes: novasOpcoes });
  };

  const updateOpcao = (index: number, valor: string) => {
    const novasOpcoes = [...(questao.opcoes || [])];
    novasOpcoes[index] = valor;
    onChange({ ...questao, opcoes: novasOpcoes });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start gap-2">
        <div {...dragHandleProps} className="cursor-grab mt-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <Label>Pergunta*</Label>
            <Textarea
              value={questao.pergunta}
              onChange={(e) => onChange({ ...questao, pergunta: e.target.value })}
              placeholder="Digite a pergunta..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Resposta</Label>
              <Select
                value={questao.tipo}
                onValueChange={(value: any) => {
                  const novaQuestao = { ...questao, tipo: value };
                  
                  // Limpar opcoes se não for múltipla escolha
                  if (value !== 'multipla_escolha') {
                    novaQuestao.opcoes = undefined;
                  } else if (!novaQuestao.opcoes || novaQuestao.opcoes.length === 0) {
                    // Inicializar com 2 opções vazias se for múltipla escolha
                    novaQuestao.opcoes = ['', ''];
                  }
                  
                  onChange(novaQuestao);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="escala">Escala (1-5)</SelectItem>
                  <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                  <SelectItem value="sim_nao">Sim/Não</SelectItem>
                  <SelectItem value="texto_livre">Texto Livre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categoria</Label>
              <CategoriaSelector
                tipo="avaliacao"
                value={questao.categoria}
                onChange={(value) => onChange({ ...questao, categoria: value })}
              />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label>Peso (1-10)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">⚖️ O que é o Peso da Questão?</p>
                      <p className="text-sm mb-2">
                        O peso define a <strong>importância</strong> desta questão no cálculo 
                        do score final do lead.
                      </p>
                      
                      <div className="space-y-1 text-sm mb-2">
                        <p><strong>Peso 1-3:</strong> Questão de contexto (pouca influência)</p>
                        <p><strong>Peso 4-6:</strong> Questão relevante (influência moderada)</p>
                        <p><strong>Peso 7-10:</strong> Questão crítica (alta influência)</p>
                      </div>
                      
                      <div className="bg-muted p-2 rounded text-xs mt-2">
                        <p className="font-semibold mb-1">📝 Exemplo Prático:</p>
                        <p className="mb-1">
                          • "Qual seu nome?" → <strong>Peso 1</strong> (não afeta qualificação)
                        </p>
                        <p className="mb-1">
                          • "Quantos funcionários?" → <strong>Peso 5</strong> (indica tamanho)
                        </p>
                        <p>
                          • "Tem orçamento aprovado?" → <strong>Peso 10</strong> (decisivo!)
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 O score final é a soma de: (resposta × peso) de todas as questões.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                min={1}
                max={10}
                value={questao.peso}
                onChange={(e) => onChange({ ...questao, peso: parseInt(e.target.value) || 1 })}
                placeholder="Ex: 5 (moderado)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {questao.peso <= 3 && "📊 Baixa importância - questão de contexto"}
                {questao.peso >= 4 && questao.peso <= 6 && "📊 Importância moderada - questão relevante"}
                {questao.peso >= 7 && "📊 Alta importância - questão crítica"}
              </p>
            </div>
          </div>

          {questao.tipo === 'multipla_escolha' && (
            <div>
              <Label>Opções de Resposta</Label>
              <div className="space-y-2 mt-2">
                {questao.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={opcao}
                      onChange={(e) => updateOpcao(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOpcao(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOpcao}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Opção
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={questao.obrigatoria}
                onCheckedChange={(checked) => onChange({ ...questao, obrigatoria: checked })}
              />
              <Label>Questão obrigatória</Label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
