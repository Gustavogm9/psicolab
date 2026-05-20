import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, Users, CheckCircle, Clock, TrendingUp, User, Mail, Calendar, FileText as FileTextIcon, Filter } from "lucide-react";
import { useAvaliacaoDetalhes } from "@/hooks/useAvaliacaoDetalhes";
import { useRelatorioAvaliacao } from "@/hooks/useRelatorioAvaliacao";
import { useExportAvaliacao } from "@/hooks/useExportAvaliacao";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularCopsoq } from "@/hooks/useCopsoqRelatorio";
import { RelatorioCopsoq } from "@/components/avaliacoes/RelatorioCopsoq";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const RelatorioAvaliacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: avaliacaoData, isLoading: loadingAvaliacao } = useAvaliacaoDetalhes(id);
  const { data: relatorioData, isLoading: loadingRelatorio } = useRelatorioAvaliacao(id);
  const { exportarCSV } = useExportAvaliacao();

  // Filtros de Setor e Cargo (hooks devem vir ANTES de qualquer early return)
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');
  const [filtroCargo, setFiltroCargo] = useState<string>('todos');

  const todasRespostas = relatorioData?.todasRespostas ?? [];
  const totalRespostas = relatorioData?.totalRespostas ?? 0;

  const opcoesSetor = useMemo(() => {
    const setores = new Set<string>();
    todasRespostas.forEach((r: any) => {
      if (r.setor) setores.add(r.setor);
    });
    return Array.from(setores).sort();
  }, [todasRespostas]);

  const opcoesCargo = useMemo(() => {
    const cargos = new Set<string>();
    todasRespostas.forEach((r: any) => {
      if (r.cargo) cargos.add(r.cargo);
    });
    return Array.from(cargos).sort();
  }, [todasRespostas]);

  const respostasFiltradas = useMemo(() => {
    return todasRespostas.filter((r: any) => {
      if (filtroSetor !== 'todos' && (r.setor || '') !== filtroSetor) return false;
      if (filtroCargo !== 'todos' && (r.cargo || '') !== filtroCargo) return false;
      return true;
    });
  }, [todasRespostas, filtroSetor, filtroCargo]);

  if (loadingAvaliacao || loadingRelatorio) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!avaliacaoData || !relatorioData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Avaliação não encontrada</p>
        </div>
      </MainLayout>
    );
  }

  // COPSOQ: renderização condicional quando instrumento === 'copsoq_medio'
  const isCopsoq = (avaliacaoData as any).instrumento === "copsoq_medio";

  // Labels da escala COPSOQ (espelhando AvaliacaoPublica)
  const getCopsoqEscalaLabels = (categoria: string): string[] => {
    if (categoria === "Saúde Geral") {
      return ["Excelente", "Muito boa", "Boa", "Razoável", "Deficitária"];
    }
    if (
      categoria === "Significado do Trabalho" ||
      categoria === "Compromisso c/ Local de Trabalho" ||
      categoria === "Satisfação Laboral" ||
      categoria === "Insegurança Laboral" ||
      categoria === "Conflito Trabalho–Família"
    ) {
      return ["Nada/quase nada", "Um pouco", "Moderadamente", "Muito", "Extremamente"];
    }
    return ["Nunca/Quase nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
  };

  // Resolve o texto/label da opção selecionada para uma resposta.
  // Retorna null quando não houver mapeamento confiável (mantém fallback ao número/valor cru).
  const getOpcaoLabel = (questao: any, valor: any): string | null => {
    if (valor === null || valor === undefined || valor === "") return null;
    const raw = String(valor);

    if (questao?.tipo === "escala") {
      const num = parseInt(raw, 10);
      if (!Number.isFinite(num) || num < 1 || num > 5) return null;
      if (isCopsoq) {
        const labels = getCopsoqEscalaLabels(questao.categoria || "");
        return labels[num - 1] ?? null;
      }
      return null;
    }

    if (questao?.tipo === "sim_nao") {
      if (raw.toLowerCase() === "sim") return "Sim";
      if (raw.toLowerCase() === "nao" || raw.toLowerCase() === "não") return "Não";
      return null;
    }

    if (questao?.tipo === "multipla_escolha" || questao?.tipo === "escolha_unica") {
      const opcoes: string[] = Array.isArray(questao?.opcoes) ? questao.opcoes : [];
      // Caso valor já seja o texto da opção (formato atual)
      if (opcoes.includes(raw)) return null; // já é o próprio texto, não duplicar
      // Caso valor seja índice numérico (1-based ou 0-based)
      const idx = parseInt(raw, 10);
      if (Number.isFinite(idx)) {
        if (opcoes[idx - 1]) return opcoes[idx - 1];
        if (opcoes[idx]) return opcoes[idx];
      }
      return null;
    }

    return null;
  };

  const totalParticipantesEsperados = (avaliacaoData as any).participantes_total ?? 0;
  const totalRespondidos = (avaliacaoData as any).participantes_responderam ?? 0;
  const taxaResposta = totalParticipantesEsperados > 0
    ? (totalRespondidos / totalParticipantesEsperados) * 100
    : totalRespostas > 0 ? 100 : 0;

  const resultadoCopsoq = isCopsoq && respostasFiltradas.length > 0
    ? calcularCopsoq(respostasFiltradas as any, avaliacaoData.questoes)
    : null;

  // Processar dados por questão
  const processarDadosQuestao = (questao: any, index?: number) => {
    const respostas = todasRespostas
      .map(r => {
        let respostasRaw = r.respostas;
        if (typeof respostasRaw === 'string') {
          try {
            respostasRaw = JSON.parse(respostasRaw);
          } catch (e) {
            console.error("Erro ao fazer parse das respostas:", e);
          }
        }
        let foundVal: any = null;
        if (Array.isArray(respostasRaw)) {
          let found = respostasRaw.find((resp: any) => resp && (resp.questao_id === questao.id || resp.id === questao.id));
          if (!found && index !== undefined && index < respostasRaw.length) {
            found = respostasRaw[index];
          }
          foundVal = found ? (found.resposta ?? found.value) : null;
        } else if (typeof respostasRaw === 'object' && respostasRaw !== null) {
          foundVal = (respostasRaw as Record<string, any>)[questao.id];
        }
        return foundVal;
      })
      .filter((val: any) => val !== null && val !== undefined && val !== '');

    if (questao.tipo === 'multipla_escolha' || questao.tipo === 'escolha_unica') {
      const contagem: Record<string, number> = {};
      respostas.forEach((resp: any) => {
        const valores = Array.isArray(resp) ? resp : [resp];
        valores.forEach((v: string) => {
          contagem[v] = (contagem[v] || 0) + 1;
        });
      });
      return Object.entries(contagem).map(([name, value]) => ({ name, value }));
    }

    if (questao.tipo === 'escala') {
      const contagem: Record<string, number> = {};
      respostas.forEach((resp: any) => {
        const valor = String(resp);
        contagem[valor] = (contagem[valor] || 0) + 1;
      });
      return Object.entries(contagem)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([name, value]) => ({ name: `${name}`, value }));
    }

    if (questao.tipo === 'sim_nao') {
      const contagem: Record<string, number> = { 'Sim': 0, 'Não': 0 };
      respostas.forEach((resp: any) => {
        const valor = String(resp).toLowerCase();
        if (valor === 'sim') contagem['Sim']++;
        else if (valor === 'não' || valor === 'nao') contagem['Não']++;
      });
      return [
        { name: 'Sim', value: contagem['Sim'] },
        { name: 'Não', value: contagem['Não'] }
      ];
    }

    return respostas;
  };

  // Agrupar por categoria
  const respostasPorCategoria: Record<string, number> = {};
  avaliacaoData.questoes.forEach((questao: any) => {
    if (questao.categoria) {
      respostasPorCategoria[questao.categoria] = (respostasPorCategoria[questao.categoria] || 0) + 1;
    }
  });

  const dadosCategoria = Object.entries(respostasPorCategoria).map(([name, value]) => ({ name, value }));

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/avaliacoes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{avaliacaoData.nome}</h1>
              <p className="text-muted-foreground">Relatório de Respostas</p>
            </div>
          </div>
          <Button onClick={() => exportarCSV(id!)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filtros por Setor e Cargo (COPSOQ) */}
        {isCopsoq && (opcoesSetor.length > 0 || opcoesCargo.length > 0) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtrar resultados por:</span>
                {(filtroSetor !== 'todos' || filtroCargo !== 'todos') && (
                  <Badge variant="secondary" className="text-xs">
                    {respostasFiltradas.length} de {totalRespostas} respondentes
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {opcoesSetor.length > 0 && (
                  <div className="space-y-1 min-w-[200px]">
                    <label className="text-xs font-medium text-muted-foreground">Setor</label>
                    <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os setores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os setores</SelectItem>
                        {opcoesSetor.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {opcoesCargo.length > 0 && (
                  <div className="space-y-1 min-w-[200px]">
                    <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                    <Select value={filtroCargo} onValueChange={setFiltroCargo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os cargos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os cargos</SelectItem>
                        {opcoesCargo.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        <div className={`grid gap-4 md:grid-cols-4 ${isCopsoq ? "hidden" : ""}`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRespostas}</div>
              <p className="text-xs text-muted-foreground">
                {avaliacaoData.participantes_total > 0 ? `${avaliacaoData.participantes_responderam} de ${avaliacaoData.participantes_total}` : 'Acesso via Link Público'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaResposta.toFixed(1)}%</div>
              <Progress value={taxaResposta} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questões</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avaliacaoData.questoes.length}</div>
              <p className="text-xs text-muted-foreground">Total de perguntas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={avaliacaoData.status === 'ativa' ? 'default' : 'secondary'}>
                {avaliacaoData.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {avaliacaoData.data_inicio && format(new Date(avaliacaoData.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Categoria */}
        {dadosCategoria.length > 0 && !isCopsoq && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Número de questões por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {dadosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Análise por Questão ou COPSOQ */}
        {isCopsoq && resultadoCopsoq ? (
          <RelatorioCopsoq resultado={resultadoCopsoq} taxaResposta={taxaResposta} totalFiltrado={filtroSetor !== 'todos' || filtroCargo !== 'todos' ? respostasFiltradas.length : undefined} />
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Análise por Questão</h2>
            {avaliacaoData.questoes.map((questao: any, index: number) => {
              const dadosQuestao = processarDadosQuestao(questao, index);
              return (
                <Card key={questao.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Questão {index + 1}</Badge>
                          {questao.categoria && <Badge variant="secondary">{questao.categoria}</Badge>}
                          <Badge variant="outline">{questao.tipo}</Badge>
                        </div>
                        <CardTitle className="text-lg">{questao.pergunta}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(questao.tipo === 'multipla_escolha' || questao.tipo === 'escolha_unica' || questao.tipo === 'escala' || questao.tipo === 'sim_nao') && Array.isArray(dadosQuestao) && dadosQuestao.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosQuestao}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="hsl(var(--primary))" name="Respostas" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : questao.tipo === 'texto_livre' ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {Array.isArray(dadosQuestao) && dadosQuestao.length > 0 ? (
                          dadosQuestao.map((resposta: any, idx: number) => (
                            <div key={idx} className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{resposta}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">Nenhuma resposta ainda</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nenhuma resposta ainda</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Respostas Individuais Detalhadas */}
        {totalRespostas > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Respostas Individuais Detalhadas</CardTitle>
              <CardDescription>
                Visualize as respostas completas de cada participante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {todasRespostas.map((resposta) => {
                  let respostasRaw = resposta.respostas;
                  if (typeof respostasRaw === 'string') {
                    try {
                      respostasRaw = JSON.parse(respostasRaw);
                    } catch (e) {
                      console.error("Erro ao fazer parse das respostas:", e);
                    }
                  }
                  const respostasArray = Array.isArray(respostasRaw)
                    ? respostasRaw
                    : [];

                  return (
                    <AccordionItem
                      key={resposta.id}
                      value={resposta.id}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3 text-left">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{resposta.nome}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{resposta.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={resposta.tipo === 'publica' ? 'default' : 'secondary'}>
                              {resposta.tipo === 'publica' ? 'Público' : 'Convidado'}
                            </Badge>
                            {resposta.data_resposta && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(resposta.data_resposta), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 mt-2">
                          {avaliacaoData.questoes.map((questao: any, qIdx: number) => {
                            let respostasRaw = resposta.respostas;
                            if (typeof respostasRaw === 'string') {
                              try {
                                respostasRaw = JSON.parse(respostasRaw);
                              } catch (e) {
                                console.error("Erro ao fazer parse das respostas:", e);
                              }
                            }
                            let respostaQuestao: any = null;

                            if (Array.isArray(respostasRaw)) {
                              let found = respostasRaw.find(
                                (r: any) => r && (r.questao_id === questao.id || r.id === questao.id)
                              );
                              if (!found && qIdx < respostasRaw.length) {
                                found = respostasRaw[qIdx];
                              }
                              if (found) {
                                respostaQuestao = {
                                  resposta: found.resposta ?? found.value,
                                };
                              }
                            } else if (typeof respostasRaw === 'object' && respostasRaw !== null) {
                              const val = (respostasRaw as Record<string, any>)[questao.id];
                              if (val !== undefined && val !== null) {
                                respostaQuestao = {
                                  resposta: val,
                                };
                              }
                            }

                            return (
                              <div
                                key={questao.id}
                                className="border-l-2 border-primary/20 pl-4 py-2"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    Q{qIdx + 1}
                                  </Badge>
                                  <p className="font-medium text-sm flex-1">
                                    {questao.pergunta}
                                  </p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3">
                                  {respostaQuestao ? (
                                    <div className="flex items-start gap-2">
                                      <FileTextIcon className="h-4 w-4 text-primary mt-0.5" />
                                      <div className="flex-1">
                                        {Array.isArray((respostaQuestao as any).resposta) ? (
                                          <div className="flex flex-wrap gap-1">
                                            {(respostaQuestao as any).resposta.map((r: string, rIdx: number) => {
                                              const label = getOpcaoLabel(questao, r);
                                              return (
                                                <Badge key={rIdx} variant="secondary">
                                                  {label ? `${r} — ${label}` : r}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          (() => {
                                            const valor = (respostaQuestao as any).resposta;
                                            const label = getOpcaoLabel(questao, valor);
                                            return (
                                              <p className="text-sm">
                                                {label ? `${String(valor)} — ${label}` : String(valor)}
                                              </p>
                                            );
                                          })()
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                      Não respondeu
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Lista de Respondentes */}
        {totalRespostas > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Respondentes</CardTitle>
              <CardDescription>{totalRespostas} pessoas responderam esta avaliação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todasRespostas.map((resposta) => (
                  <div key={resposta.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{resposta.nome}</p>
                      <p className="text-sm text-muted-foreground">{resposta.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={resposta.tipo === 'publica' ? 'default' : 'secondary'}>
                        {resposta.tipo === 'publica' ? 'Público' : 'Convidado'}
                      </Badge>
                      {resposta.data_resposta && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(resposta.data_resposta), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatorioAvaliacao;
