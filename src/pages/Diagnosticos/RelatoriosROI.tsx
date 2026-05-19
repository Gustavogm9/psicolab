import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  Users,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Mail,
  Printer,
  Loader2
} from "lucide-react";
import { useRelatoriosROI, useRelatorioCreate } from "@/hooks/useRelatoriosROI";
import { useLeadsCRM } from "@/hooks/useLeadsCRM";
import { supabase } from "@/integrations/supabase/client";
import { calculateROI } from "@/lib/analysis-engine";
import { useExportRelatorioROI } from "@/hooks/useExportRelatorioROI";
import { Share2 } from "lucide-react";

const RelatoriosROI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelatorio, setSelectedRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [novoRelatorioDialogOpen, setNovoRelatorioDialogOpen] = useState(false);
  const [filtrosDialogOpen, setFiltrosDialogOpen] = useState(false);
  const [visualizarDialogOpen, setVisualizarDialogOpen] = useState(false);
  const [novoRelatorioForm, setNovoRelatorioForm] = useState({
    leadId: "",
    dataInicio: "",
    dataFim: "",
    investimento: "",
    observacoes: "",
    numeroFuncionarios: "50",
    salarioMedio: "5000"
  });

  const { data: relatorios = [], isLoading: loadingRelatorios } = useRelatoriosROI();
  const { data: leads = [], isLoading: loadingLeads } = useLeadsCRM();
  const createRelatorio = useRelatorioCreate();
  const { exportarPDF, compartilharEmail } = useExportRelatorioROI();

  const filteredRelatorios = relatorios.filter(relatorio => {
    const matchesSearch = searchTerm === "" || 
      relatorio.questionario?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalRelatorios: relatorios.length,
    investimentoTotal: relatorios.reduce((acc, r) => acc + (r.investimento || 0), 0),
    economiaTotal: relatorios.reduce((acc, r) => acc + (r.retorno_estimado || 0), 0),
    roiMedio: relatorios.length > 0 
      ? relatorios.reduce((acc, r) => acc + (r.roi_percentual || 0), 0) / relatorios.length 
      : 0
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return "text-green-600";
    if (roi >= 200) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleNovoRelatorio = () => {
    setNovoRelatorioDialogOpen(true);
  };

  const relatorioSchema = z.object({
    leadId: z.string().min(1, "Selecione um lead"),
    dataInicio: z.string().min(1, "Data início é obrigatória"),
    dataFim: z.string().min(1, "Data fim é obrigatória"),
    investimento: z.string().min(1, "Investimento é obrigatório"),
    numeroFuncionarios: z.string().min(1, "Número de funcionários é obrigatório"),
    salarioMedio: z.string().min(1, "Salário médio é obrigatório"),
    observacoes: z.string().max(1000, "Observações muito longas").optional()
  });

  const handleSalvarNovoRelatorio = async () => {
    try {
      const validatedData = relatorioSchema.parse(novoRelatorioForm);
      const lead = leads.find(l => l.id === validatedData.leadId);
      
      if (!lead || !lead.resposta_id) {
        toast.error("Lead inválido ou sem resposta associada");
        return;
      }

      setLoading(true);

      // Buscar a resposta completa com análise
      const { data: resposta } = await supabase
        .from('respostas_diagnostico')
        .select('questionario_id, score_total, analise_completa')
        .eq('id', lead.resposta_id)
        .single();

      if (!resposta) {
        toast.error("Resposta não encontrada");
        setLoading(false);
        return;
      }

      // Buscar total de respostas do questionário no período
      const { data: respostasTotal } = await supabase
        .from('respostas_diagnostico')
        .select('id', { count: 'exact' })
        .eq('questionario_id', resposta.questionario_id)
        .gte('data_inicio', validatedData.dataInicio)
        .lte('data_inicio', validatedData.dataFim);

      // Buscar leads gerados no período
      const { data: leadsData } = await supabase
        .from('leads_diagnostico')
        .select('id', { count: 'exact' })
        .gte('created_at', validatedData.dataInicio)
        .lte('created_at', validatedData.dataFim)
        .in('resposta_id', (await supabase
          .from('respostas_diagnostico')
          .select('id')
          .eq('questionario_id', resposta.questionario_id)
          .gte('data_inicio', validatedData.dataInicio)
          .lte('data_inicio', validatedData.dataFim)
        ).data?.map(r => r.id) || []);

      const totalRespostas = respostasTotal?.length || 1;
      const leadsGerados = leadsData?.length || 1;
      const taxaConversao = (leadsGerados / totalRespostas) * 100;

      // Usar análise existente ou calcular se não existir
      const analysisResult = (typeof resposta.analise_completa === 'object' && resposta.analise_completa !== null) 
        ? resposta.analise_completa as any
        : {
            score_total: resposta.score_total || 0,
            percentual_total: ((resposta.score_total || 0) / 100) * 100,
            nivel_geral: 'medio' as const,
            categorias: [],
            recomendacoes: [],
            pontos_fracos: [],
            pontos_fortes: []
          };

      const numeroFuncionarios = parseInt(validatedData.numeroFuncionarios);
      const salarioMedio = parseFloat(validatedData.salarioMedio);
      const investimento = parseFloat(validatedData.investimento);

      // Calcular ROI usando o analysis engine
      const roiCalculation = calculateROI(analysisResult as any, numeroFuncionarios);
      
      // Ajustar cálculos com investimento real fornecido
      const economiaAnual = roiCalculation.economiaAnual;
      const retornoEstimado = economiaAnual - investimento;
      const roiPercentual = ((economiaAnual - investimento) / investimento) * 100;
      const paybackMeses = (investimento / (economiaAnual / 12));

      await createRelatorio.mutateAsync({
        questionario_id: resposta.questionario_id,
        data_inicio: validatedData.dataInicio,
        data_fim: validatedData.dataFim,
        total_respostas: totalRespostas,
        leads_gerados: leadsGerados,
        taxa_conversao: taxaConversao,
        investimento,
        retorno_estimado: economiaAnual,
        roi_percentual: roiPercentual,
        metricas_detalhadas: {
          lead_id: lead.id,
          observacoes: validatedData.observacoes || '',
          numero_funcionarios: numeroFuncionarios,
          salario_medio: salarioMedio,
          analise_completa: analysisResult,
          roi_detalhado: {
            ...roiCalculation,
            payback_meses: paybackMeses,
            retorno_liquido: retornoEstimado
          }
        }
      });
      
      setNovoRelatorioDialogOpen(false);
      setNovoRelatorioForm({ 
        leadId: "", 
        dataInicio: "", 
        dataFim: "", 
        investimento: "",
        numeroFuncionarios: "50",
        salarioMedio: "5000",
        observacoes: "" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Erro ao criar relatório:", error);
        toast.error("Erro ao criar relatório");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarRelatorio = (relatorio: any) => {
    setSelectedRelatorio(relatorio);
    setVisualizarDialogOpen(true);
  };

  const handleFiltrosAvancados = () => {
    setFiltrosDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Relatórios ROI
            </h1>
            <p className="text-muted-foreground mt-1">
              Gere e gerencie relatórios de retorno sobre investimento baseados nos diagnósticos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFiltrosAvancados}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
            <Button onClick={handleNovoRelatorio} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Relatórios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRelatorios}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.investimentoTotal)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retorno Estimado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.economiaTotal)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.roiMedio)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por questionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lista" className="w-full">
          <TabsList>
            <TabsTrigger value="lista">Lista de Relatórios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios ROI Gerados</CardTitle>
                <CardDescription>
                  {filteredRelatorios.length} relatórios encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingRelatorios || loadingLeads ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Carregando relatórios...</p>
                    </div>
                  ) : filteredRelatorios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum relatório encontrado</p>
                    </div>
                  ) : (
                    filteredRelatorios.map((relatorio) => {
                      const metricas = relatorio.metricas_detalhadas as any;
                      const leadData = metricas?.lead_id 
                        ? leads.find(l => l.id === metricas.lead_id)
                        : null;
                      
                      return (
                        <div key={relatorio.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">
                                  {relatorio.questionario?.titulo || 'Questionário'}
                                </h3>
                                <div className={`flex items-center gap-1 font-bold ${getROIColor(relatorio.roi_percentual || 0)}`}>
                                  {(relatorio.roi_percentual || 0) >= 200 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                  {formatPercentage(relatorio.roi_percentual || 0)} ROI
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                {leadData && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {leadData.nome}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      {leadData.categoria}
                                    </div>
                                  </>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(relatorio.data_inicio).toLocaleDateString('pt-BR')} - {new Date(relatorio.data_fim).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600">
                                    {formatCurrency(relatorio.investimento || 0)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Investimento</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(relatorio.retorno_estimado || 0)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Retorno Estimado</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">
                                    {relatorio.total_respostas || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Respostas</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">
                                    {relatorio.leads_gerados || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Leads Gerados</div>
                                </div>
                              </div>
                              
                              {metricas?.observacoes && (
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">Observações:</div>
                                  <p className="text-sm text-muted-foreground">
                                    {metricas.observacoes}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleVisualizarRelatorio(relatorio)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => exportarPDF(relatorio.id)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Exportar PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição de ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ROI Alto (&gt; 300%)</span>
                      <Badge variant="default">
                        {relatorios.filter(r => (r.roi_percentual || 0) > 300).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ROI Médio (200-300%)</span>
                      <Badge variant="secondary">
                        {relatorios.filter(r => (r.roi_percentual || 0) >= 200 && (r.roi_percentual || 0) <= 300).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ROI Baixo (&lt; 200%)</span>
                      <Badge variant="outline">
                        {relatorios.filter(r => (r.roi_percentual || 0) < 200).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Estatísticas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Taxa de Conversão Média</div>
                      <div className="text-2xl font-bold">
                        {relatorios.length > 0 
                          ? `${(relatorios.reduce((acc, r) => acc + (r.taxa_conversao || 0), 0) / relatorios.length).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total de Leads Analisados</div>
                      <div className="text-2xl font-bold">
                        {relatorios.reduce((acc, r) => acc + (r.leads_gerados || 0), 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Novo Relatório Dialog */}
        <Dialog open={novoRelatorioDialogOpen} onOpenChange={setNovoRelatorioDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Novo Relatório ROI</DialogTitle>
              <DialogDescription>
                Preencha as informações para gerar um relatório de ROI baseado em dados reais
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lead">Lead / Resposta</Label>
                <Select 
                  value={novoRelatorioForm.leadId}
                  onValueChange={(value) => setNovoRelatorioForm(prev => ({ ...prev, leadId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.nome} - {lead.categoria} ({lead.score} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início (Período de Análise)</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={novoRelatorioForm.dataInicio}
                    onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, dataInicio: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim (Período de Análise)</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={novoRelatorioForm.dataFim}
                    onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Contexto da Empresa
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroFuncionarios">Número de Funcionários</Label>
                    <Input
                      id="numeroFuncionarios"
                      type="number"
                      placeholder="Ex: 50"
                      value={novoRelatorioForm.numeroFuncionarios}
                      onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, numeroFuncionarios: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salarioMedio">Salário Médio (R$)</Label>
                    <Input
                      id="salarioMedio"
                      type="number"
                      placeholder="Ex: 5000"
                      value={novoRelatorioForm.salarioMedio}
                      onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, salarioMedio: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investimento">Investimento Planejado em Intervenções (R$)</Label>
                <Input
                  id="investimento"
                  type="number"
                  placeholder="Ex: 50000"
                  value={novoRelatorioForm.investimento}
                  onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, investimento: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Valor estimado para implementar as melhorias recomendadas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre este relatório..."
                  value={novoRelatorioForm.observacoes}
                  onChange={(e) => setNovoRelatorioForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoRelatorioDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarNovoRelatorio} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculando ROI...
                  </>
                ) : (
                  'Gerar Relatório'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visualizar Relatório Dialog */}
        <Dialog open={visualizarDialogOpen} onOpenChange={setVisualizarDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle>Análise Detalhada de ROI</DialogTitle>
                  <DialogDescription>
                    Relatório completo com análise de retorno sobre investimento
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedRelatorio && exportarPDF(selectedRelatorio.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedRelatorio) {
                        const emails = prompt('Digite os emails separados por vírgula:');
                        if (emails) {
                          compartilharEmail(selectedRelatorio.id, emails.split(',').map(e => e.trim()));
                        }
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            {selectedRelatorio && (
              <div className="space-y-6 py-4">
                {(() => {
                  const metricas = selectedRelatorio.metricas_detalhadas as any;
                  const roiDetalhado = metricas?.roi_detalhado;
                  const analiseCompleta = metricas?.analise_completa;
                  
                  return (
                <>
                  {/* Resumo Executivo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo Executivo</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Questionário</div>
                        <div className="font-medium">{selectedRelatorio.questionario?.titulo}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Período</div>
                        <div className="font-medium">
                          {new Date(selectedRelatorio.data_inicio).toLocaleDateString('pt-BR')} - {' '}
                          {new Date(selectedRelatorio.data_fim).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {metricas?.numero_funcionarios && (
                        <div>
                          <div className="text-sm text-muted-foreground">Funcionários Impactados</div>
                          <div className="font-medium">{metricas.numero_funcionarios}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Total de Respostas</div>
                        <div className="font-medium">{selectedRelatorio.total_respostas || 0}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas Financeiras */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Análise Financeira
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-red-500/10 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Investimento</div>
                          <div className="font-bold text-xl text-red-600">{formatCurrency(selectedRelatorio.investimento || 0)}</div>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Economia Anual</div>
                          <div className="font-bold text-xl text-green-600">{formatCurrency(selectedRelatorio.retorno_estimado || 0)}</div>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Retorno Líquido</div>
                          <div className="font-bold text-xl text-blue-600">
                            {formatCurrency((selectedRelatorio.retorno_estimado || 0) - (selectedRelatorio.investimento || 0))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">ROI (Retorno sobre Investimento)</div>
                            <div className={`font-bold text-3xl ${getROIColor(selectedRelatorio.roi_percentual || 0)}`}>
                              {formatPercentage(selectedRelatorio.roi_percentual || 0)}
                            </div>
                          </div>
                          {roiDetalhado?.payback_meses && (
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Payback</div>
                              <div className="font-bold text-2xl">
                                {roiDetalhado.payback_meses.toFixed(1)} meses
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Benefícios Identificados */}
                  {roiDetalhado?.beneficios && roiDetalhado.beneficios.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Benefícios Identificados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {roiDetalhado.beneficios.map((beneficio: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span>{beneficio}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Análise por Categorias */}
                  {analiseCompleta?.categorias && analiseCompleta.categorias.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Análise por Categorias
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analiseCompleta.categorias.map((cat: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <div className="font-medium">{cat.nome || cat.categoria}</div>
                              <div className="text-sm text-muted-foreground">
                                {cat.score || 0} / {cat.score_maximo || 100} pontos
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={cat.percentual >= 70 ? "default" : cat.percentual >= 40 ? "secondary" : "destructive"}>
                                {cat.percentual?.toFixed(1)}% - {cat.nivel}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Recomendações */}
                  {analiseCompleta?.recomendacoes && analiseCompleta.recomendacoes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Recomendações de Ação
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analiseCompleta.recomendacoes.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observações */}
                  {metricas?.observacoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{metricas.observacoes}</p>
                      </CardContent>
                    </Card>
                  )}
                </>
                );
                })()}
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setVisualizarDialogOpen(false)}>
                Fechar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filtros Avançados Dialog */}
        <Dialog open={filtrosDialogOpen} onOpenChange={setFiltrosDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtros Avançados</DialogTitle>
              <DialogDescription>
                Refine sua busca com filtros personalizados
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Faixa de ROI (%)</Label>
                <div className="flex gap-2">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Período Personalizado</Label>
                <div className="flex gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setFiltrosDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setFiltrosDialogOpen(false);
                toast.success("Filtros aplicados");
              }}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default RelatoriosROI;
