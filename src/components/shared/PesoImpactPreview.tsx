import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, BarChart3 } from "lucide-react";

interface Questao {
  id?: string;
  pergunta?: string;
  texto?: string;
  peso: number;
  categoria?: string;
  tipo?: string;
}

interface PesoImpactPreviewProps {
  questoes: Questao[];
  escala?: number; // 5 para diagnósticos, 10 para avaliações
}

export function PesoImpactPreview({ questoes, escala = 10 }: PesoImpactPreviewProps) {
  if (!questoes || questoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Adicione questões para ver o impacto dos pesos
          </p>
        </CardContent>
      </Card>
    );
  }

  // Cálculos
  const pesoTotal = questoes.reduce((acc, q) => acc + (q.peso || 1), 0);
  const pesoMedio = pesoTotal / questoes.length;
  const scoreMaximoPossivel = questoes.reduce((acc, q) => {
    const peso = q.peso || 1;
    return acc + (peso * 1); // valor máximo normalizado = 1
  }, 0);

  // Distribuição por categoria
  const distribuicaoPorCategoria = questoes.reduce((acc, q) => {
    const cat = q.categoria || "Sem categoria";
    if (!acc[cat]) {
      acc[cat] = { total: 0, questoes: 0 };
    }
    acc[cat].total += q.peso || 1;
    acc[cat].questoes += 1;
    return acc;
  }, {} as Record<string, { total: number; questoes: number }>);

  const categorias = Object.entries(distribuicaoPorCategoria)
    .map(([nome, dados]) => ({
      nome,
      peso: dados.total,
      percentual: (dados.total / pesoTotal) * 100,
      questoes: dados.questoes,
    }))
    .sort((a, b) => b.peso - a.peso);

  // Top 3 questões mais influentes
  const questoesMaisInfluentes = [...questoes]
    .sort((a, b) => (b.peso || 1) - (a.peso || 1))
    .slice(0, 3)
    .map((q, idx) => ({
      posicao: idx + 1,
      texto: q.pergunta || q.texto || "Questão sem texto",
      peso: q.peso || 1,
      percentual: ((q.peso || 1) / pesoTotal) * 100,
    }));

  // Simulações
  const cenarioMaximo = scoreMaximoPossivel;
  const cenarioMinimo = 0;
  const cenarioMisto = questoes.reduce((acc, q) => {
    const peso = q.peso || 1;
    // Simula respostas variadas (média de 0.5)
    return acc + (peso * 0.5);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Score Total Possível */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Score Máximo Possível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {scoreMaximoPossivel.toFixed(1)}
              </span>
              <span className="text-muted-foreground">pontos</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Peso total distribuído: {pesoTotal}</p>
              <p>Peso médio por questão: {pesoMedio.toFixed(1)}</p>
              <p>Total de questões: {questoes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribuição por Categoria
          </CardTitle>
          <CardDescription>
            Como o peso está distribuído entre as categorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categorias.map((cat) => (
            <div key={cat.nome} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{cat.nome}</Badge>
                  <span className="text-muted-foreground">
                    {cat.questoes} {cat.questoes === 1 ? "questão" : "questões"}
                  </span>
                </div>
                <span className="font-medium">
                  {cat.percentual.toFixed(0)}%
                </span>
              </div>
              <Progress value={cat.percentual} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Peso: {cat.peso} de {pesoTotal}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Questões Mais Influentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Questões Mais Influentes
          </CardTitle>
          <CardDescription>
            Top 3 questões com maior impacto no resultado final
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {questoesMaisInfluentes.map((q) => (
            <div
              key={q.posicao}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {q.posicao}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 mb-1">
                  {q.texto}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Peso: {q.peso}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {q.percentual.toFixed(1)}% do total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Simulações de Cenários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Simulações de Cenários</CardTitle>
          <CardDescription>
            Como diferentes padrões de resposta afetam o score final
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Respostas máximas</span>
              <span className="text-sm font-bold text-green-600">
                {cenarioMaximo.toFixed(1)} pontos (100%)
              </span>
            </div>
            <Progress value={100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Se todas as questões forem respondidas com o valor máximo
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cenário misto</span>
              <span className="text-sm font-bold text-blue-600">
                {cenarioMisto.toFixed(1)} pontos ({((cenarioMisto / cenarioMaximo) * 100).toFixed(0)}%)
              </span>
            </div>
            <Progress value={(cenarioMisto / cenarioMaximo) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Simulação com respostas médias (50% do valor máximo)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Respostas mínimas</span>
              <span className="text-sm font-bold text-red-600">
                {cenarioMinimo.toFixed(1)} pontos (0%)
              </span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Se todas as questões forem respondidas com o valor mínimo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de Desequilíbrio */}
      {questoes.some((q) => (q.peso || 1) > pesoMedio * 2) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-yellow-600 text-2xl">⚠️</div>
              <div className="space-y-1">
                <p className="font-medium text-yellow-900">
                  Desequilíbrio detectado
                </p>
                <p className="text-sm text-yellow-800">
                  Algumas questões têm peso muito superior à média ({pesoMedio.toFixed(1)}). 
                  Isso pode distorcer os resultados. Certifique-se que isso é intencional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
