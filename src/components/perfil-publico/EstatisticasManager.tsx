import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, TrendingUp } from "lucide-react";

interface Estatistica {
  id: string;
  icone: string;
  numero: string;
  label: string;
  descricao: string;
}

interface EstatisticasManagerProps {
  estatisticas: Estatistica[];
  onChange: (estatisticas: Estatistica[]) => void;
}

export function EstatisticasManager({ estatisticas, onChange }: EstatisticasManagerProps) {
  const adicionarEstatistica = () => {
    const novaEstatistica: Estatistica = {
      id: crypto.randomUUID(),
      icone: "TrendingUp",
      numero: "0",
      label: "",
      descricao: ""
    };
    onChange([...estatisticas, novaEstatistica]);
  };

  const removerEstatistica = (id: string) => {
    onChange(estatisticas.filter(e => e.id !== id));
  };

  const atualizarEstatistica = (id: string, campo: keyof Estatistica, valor: string) => {
    onChange(estatisticas.map(e => 
      e.id === id ? { ...e, [campo]: valor } : e
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Números & Conquistas
        </CardTitle>
        <CardDescription>
          Destaque suas conquistas e números de impacto para gerar credibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {estatisticas.map((estatistica, index) => (
          <Card key={estatistica.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Ícone (nome do Lucide Icon)</Label>
                    <Input
                      value={estatistica.icone}
                      onChange={(e) => atualizarEstatistica(estatistica.id, 'icone', e.target.value)}
                      placeholder="TrendingUp, Users, Award, Target, etc"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Veja ícones em: lucide.dev/icons
                    </p>
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={estatistica.numero}
                      onChange={(e) => atualizarEstatistica(estatistica.id, 'numero', e.target.value)}
                      placeholder="Ex: 500+, 15 anos, 98%"
                    />
                  </div>
                </div>
                <div>
                  <Label>Label / Título</Label>
                  <Input
                    value={estatistica.label}
                    onChange={(e) => atualizarEstatistica(estatistica.id, 'label', e.target.value)}
                    placeholder="Ex: Clientes Atendidos, Anos de Experiência"
                  />
                </div>
                <div>
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={estatistica.descricao}
                    onChange={(e) => atualizarEstatistica(estatistica.id, 'descricao', e.target.value)}
                    placeholder="Contexto adicional sobre este número..."
                    rows={2}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removerEstatistica(estatistica.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        
        {estatisticas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma estatística adicionada ainda</p>
            <p className="text-xs">Adicione números que demonstram seu impacto!</p>
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={adicionarEstatistica}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Estatística
        </Button>
      </CardContent>
    </Card>
  );
}
