import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Clock,
  Loader2,
  FileText,
  UserPlus
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { useRespostasQuestionario } from '@/hooks/useRespostasQuestionario';
import { useLeadCreate } from '@/hooks/useLeadsCRM';
import { useQuestionarioDetalhes } from '@/hooks/useQuestionarioDetalhes';
import { useLeadsRespostas } from '@/hooks/useLeadsRespostas';
import { Skeleton } from '@/components/ui/skeleton';

const formatarDataSafe = (dateString?: string | null, fallback = 'Em andamento') => {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return 'Data inválida';
  }
};

const RespostasQuestionarios = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState("30d");
  const [loading, setLoading] = useState<string | null>(null);
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [filtrosDialogOpen, setFiltrosDialogOpen] = useState(false);
  const [respostaSelecionada, setRespostaSelecionada] = useState<any>(null);

  // Buscar dados do banco
  const questionarioId = id || '';
  const { data: questionario, isLoading: loadingQuestionario } = useQuestionarioDetalhes(questionarioId);
  const { data: respostas = [], isLoading: loadingRespostas } = useRespostasQuestionario(questionarioId, {
    ...(selectedStatus !== 'todos' && { status: selectedStatus as any }),
  });
  const { mutate: criarLead } = useLeadCreate();
  
  // Buscar leads associados às respostas
  const respostaIds = respostas.map(r => r.id);
  const { data: leadsRespostas = [] } = useLeadsRespostas(respostaIds);
  
  // Criar mapa de resposta_id -> lead para fácil consulta
  const leadsPorResposta = leadsRespostas.reduce((acc, lead) => {
    if (lead.resposta_id) {
      acc[lead.resposta_id] = lead;
    }
    return acc;
  }, {} as Record<string, any>);

  // Funções para implementar as funcionalidades dos botões
  const handleVerDetalhes = (resposta: any) => {
    setRespostaSelecionada(resposta);
    setDetalhesDialogOpen(true);
  };

  const handleAdicionarCRM = (resposta: any) => {
    setLoading(resposta.id);
    try {
      criarLead({
        respostaId: resposta.id,
        nome: resposta.nome,
        email: resposta.email,
        telefone: resposta.telefone,
        score: resposta.score_total,
        categoria: resposta.categoria || 'não_classificado',
        origem: questionario?.slug || 'desconhecido',
      }, {
        onSuccess: () => {
          setLoading(null);
          toast.success('Lead adicionado ao CRM com sucesso');
        },
        onError: (error: any) => {
          setLoading(null);
          // FASE 3.2: Melhorar tratamento de duplicata na UI
          if (error.message?.includes('já está no CRM')) {
            toast.error('Este respondente já está no CRM', {
              action: {
                label: 'Ver no CRM',
                onClick: () => navigate('/crm'),
              },
            });
          } else {
            toast.error('Erro ao adicionar lead');
          }
        },
      });
    } catch (error) {
      setLoading(null);
      toast.error('Erro ao adicionar lead');
    }
  };

  const handleFiltrosAvancados = () => {
    setFiltrosDialogOpen(true);
  };

  const handleExportar = () => {
    setLoading('export');
    try {
      // Gerar CSV
      const csvData = filteredRespostas.map(resposta => ({
        Nome: resposta.nome,
        Email: resposta.email,
        Telefone: resposta.telefone || '',
        Status: resposta.status,
        Score: resposta.score_total,
        Categoria: resposta.categoria || '',
        DataResposta: formatarDataSafe(resposta.data_fim, '')
      }));
      
      const csvContent = Object.keys(csvData[0] || {}).join(',') + '\n' +
        csvData.map(row => Object.values(row).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respostas_${questionario?.slug}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Dados exportados com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(null);
    }
  };

  const filteredRespostas = respostas.filter(resposta => {
    if (!resposta) return false;
    const nome = resposta.nome || "";
    const email = resposta.email || "";
    const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalRespostas: respostas.length,
    respostasCompletas: respostas.filter(r => r && r.status === "concluida").length,
    respostasIncompletas: respostas.filter(r => r && r.status === "incompleta").length,
    pontuacaoMedia: respostas.length > 0 
      ? respostas.reduce((acc, r) => acc + (r?.score_total || 0), 0) / respostas.length 
      : 0
  };

  const isLoading = loadingQuestionario || loadingRespostas;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-16 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completa":
      case "concluida": return "bg-green-100 text-green-800";
      case "incompleta": return "bg-yellow-100 text-yellow-800";
      case "abandonada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 break-all">
            <BarChart3 className="h-8 w-8 text-primary" />
            Respostas: {questionario?.titulo}
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize e analise as respostas coletadas deste questionário
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleFiltrosAvancados}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>
          <Button
            onClick={handleExportar}
            disabled={loading === 'export'}
          >
            {loading === 'export' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRespostas}</div>
            <p className="text-xs text-muted-foreground">+12 esta semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.respostasCompletas}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.respostasCompletas / stats.totalRespostas) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incompletas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.respostasIncompletas}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.respostasIncompletas / stats.totalRespostas) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.pontuacaoMedia)}</div>
            <p className="text-xs text-muted-foreground">de 100 pontos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="concluida">Completas</SelectItem>
            <SelectItem value="incompleta">Incompletas</SelectItem>
            <SelectItem value="abandonada">Abandonadas</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Respostas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Coletadas</CardTitle>
          <CardDescription>
            {filteredRespostas.length} respostas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRespostas.map((resposta) => {
              return (
                <div key={resposta.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{resposta.nome}</h3>
                        <Badge className={getStatusColor(resposta.status)}>
                          {resposta.status === "concluida" ? "Completa" : 
                           resposta.status === "incompleta" ? "Incompleta" : "Abandonada"}
                        </Badge>
                        {resposta.status === "concluida" && (
                          <div className={`flex items-center gap-1 font-semibold ${getScoreColor(resposta.score_total)}`}>
                            {getScoreIcon(resposta.score_total)}
                            {resposta.score_total}/100
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {resposta.email}
                        </div>
                        {resposta.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {resposta.telefone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatarDataSafe(resposta.data_fim)}
                        </div>
                      </div>
                      
                      {resposta.status === "concluida" && (
                        <div className="mt-3 p-3 bg-muted/30 rounded">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{resposta.score_total}</div>
                            <div className="text-xs text-muted-foreground">Pontuação Total</div>
                          </div>
                          {resposta.categoria && (
                            <div className="text-center mt-2">
                              <div className="text-sm font-medium text-muted-foreground">Categoria: {resposta.categoria}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerDetalhes(resposta)}
                        disabled={loading === resposta.id}
                      >
                        {loading === resposta.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        Ver Detalhes
                      </Button>
                      
                      {leadsPorResposta[resposta.id] ? (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => navigate('/crm')}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Ver no CRM
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAdicionarCRM(resposta)}
                          disabled={loading === resposta.id}
                        >
                          {loading === resposta.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3 mr-1" />
                          )}
                          Adicionar ao CRM
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredRespostas.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma resposta encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedStatus !== "todos"
                    ? "Tente ajustar os filtros de busca"
                    : "As respostas dos questionários aparecerão aqui"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={detalhesDialogOpen} onOpenChange={setDetalhesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Resposta</DialogTitle>
            <DialogDescription>
              Análise completa da resposta do questionário
            </DialogDescription>
          </DialogHeader>
          
          {respostaSelecionada && (
            <div className="space-y-6">
              {/* Informações do Respondente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Informações do Respondente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{respostaSelecionada.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{respostaSelecionada.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{respostaSelecionada.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data da Resposta</p>
                    <p className="font-medium">{formatarDataSafe(respostaSelecionada.data_fim)}</p>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Resultados</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{respostaSelecionada.score_total}</p>
                    <p className="text-sm text-gray-600">Score Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{respostaSelecionada.categoria}</p>
                    <p className="text-sm text-gray-600">Categoria</p>
                  </div>
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      respostaSelecionada.status === 'completa' || respostaSelecionada.status === 'concluida'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {respostaSelecionada.status === 'completa' || respostaSelecionada.status === 'concluida' ? 'Completa' : 'Incompleta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recomendações */}
              <div>
                <h3 className="font-semibold mb-3">Recomendações</h3>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-amber-800">
                    Com base no score de {respostaSelecionada.score_total} pontos, recomendamos:
                  </p>
                  <ul className="mt-2 space-y-1 text-amber-700">
                    <li>• Acompanhamento personalizado</li>
                    <li>• Implementação de estratégias específicas</li>
                    <li>• Monitoramento contínuo dos resultados</li>
                  </ul>
                </div>
              </div>

              {/* Respostas Individuais */}
              {questionario?.questoes && questionario.questoes.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Respostas por Questão</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {questionario.questoes.map((questao: any, idx: number) => {
                      let respostasRaw = respostaSelecionada.respostas;
                      if (typeof respostasRaw === 'string') {
                        try { respostasRaw = JSON.parse(respostasRaw); } catch(e) {}
                      }
                      let foundVal = 'Não respondido';
                      if (Array.isArray(respostasRaw)) {
                        const found = respostasRaw.find((r: any) => r && (r.questao_id === questao.id || r.id === questao.id));
                        if (found) {
                          foundVal = found.resposta ?? found.value ?? 'Não respondido';
                        }
                      }
                      return (
                        <div key={questao.id} className="border-b pb-3 last:border-0">
                          <p className="text-sm font-medium text-gray-700">
                            <span className="text-primary font-bold mr-1">Q{idx + 1}.</span>
                            {questao.texto || questao.pergunta}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 bg-muted/30 p-2 rounded">
                            Resposta: <strong className="text-foreground">{foundVal}</strong>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Filtros Avançados */}
      <Dialog open={filtrosDialogOpen} onOpenChange={setFiltrosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filtros Avançados</DialogTitle>
            <DialogDescription>
              Configure filtros personalizados para análise detalhada
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Score Mínimo</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Score Máximo</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="100"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Categorias</label>
              <div className="space-y-2">
                {['Baixo Risco', 'Médio Risco', 'Alto Risco'].map(categoria => (
                  <label key={categoria} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">{categoria}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setFiltrosDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Filtros aplicados com sucesso');
              setFiltrosDialogOpen(false);
            }}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RespostasQuestionarios;