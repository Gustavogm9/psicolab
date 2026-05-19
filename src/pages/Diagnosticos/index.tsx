import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  QrCode, 
  Calendar, 
  Brain, 
  Users, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import AnalyticsDashboard from '@/components/diagnosticos/AnalyticsDashboard';
import { useQuestionarios } from '@/hooks/useQuestionarios';
import { useQuestionarioDelete } from '@/hooks/useQuestionarioDelete';
import { useQuestionarioUpdate } from '@/hooks/useQuestionarioUpdate';
import { useTendenciasDiagnosticos } from '@/hooks/useTendenciasDiagnosticos';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureExplanation } from '@/components/shared/FeatureExplanation';

const Diagnosticos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionarioToDelete, setQuestionarioToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("questionarios");

  // Buscar questionários do banco
  const { data: questionarios = [], isLoading } = useQuestionarios({
    ...(selectedCategory !== 'todos' && { categoria: selectedCategory }),
  });

  const { data: tendencias, isLoading: isLoadingTendencias } = useTendenciasDiagnosticos();

  const { mutate: deleteQuestionario } = useQuestionarioDelete();
  const { mutate: toggleAtivo } = useQuestionarioUpdate();

  const handleDeletarQuestionario = (questionarioId: string) => {
    setQuestionarioToDelete(questionarioId);
    setDeleteDialogOpen(true);
  };

  const confirmarDelecao = () => {
    if (!questionarioToDelete) return;
    
    setLoading(questionarioToDelete);
    deleteQuestionario(questionarioToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setQuestionarioToDelete(null);
        setLoading(null);
      },
      onError: () => {
        setLoading(null);
      },
    });
  };

  const handleToggleAtivo = (id: string, ativoAtual: boolean) => {
    toggleAtivo({
      id,
      ativo: !ativoAtual,
    });
  };

  const filteredQuestionarios = questionarios.filter(questionario => {
    const matchesSearch = questionario.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (questionario.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalQuestionarios: questionarios.length,
    totalRespostas: questionarios.reduce((acc, q) => acc + q.total_respostas, 0),
    leadsGerados: questionarios.reduce((acc, q) => acc + q.leads_gerados, 0),
    taxaConversao: questionarios.reduce((acc, q) => acc + q.total_respostas, 0) > 0
      ? (questionarios.reduce((acc, q) => acc + q.leads_gerados, 0) / questionarios.reduce((acc, q) => acc + q.total_respostas, 0)) * 100
      : 0
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Captação de Leads
            <Badge variant="secondary">PÚBLICO</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie questionários públicos e gere leads qualificados automaticamente
          </p>
        </div>
        <Link to="/diagnosticos/criar">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Questionário
          </Button>
        </Link>
      </div>

      {/* Feature Explanation */}
      <FeatureExplanation type="captacao" />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questionarios" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Questionários
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questionarios" className="space-y-6">

          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questionários</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestionarios}</div>
            {isLoadingTendencias ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : tendencias ? (
              <div className="flex items-center gap-1 mt-1">
                {tendencias.questionarios.tipo === 'positivo' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {tendencias.questionarios.tipo === 'negativo' && <TrendingDown className="h-3 w-3 text-red-600" />}
                <p className={`text-xs ${
                  tendencias.questionarios.tipo === 'positivo' ? 'text-green-600' : 
                  tendencias.questionarios.tipo === 'negativo' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {tendencias.questionarios.textoVariacao}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">-</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRespostas}</div>
            {isLoadingTendencias ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : tendencias ? (
              <div className="flex items-center gap-1 mt-1">
                {tendencias.respostas.tipo === 'positivo' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {tendencias.respostas.tipo === 'negativo' && <TrendingDown className="h-3 w-3 text-red-600" />}
                <p className={`text-xs ${
                  tendencias.respostas.tipo === 'positivo' ? 'text-green-600' : 
                  tendencias.respostas.tipo === 'negativo' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {tendencias.respostas.textoVariacao}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">-</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsGerados}</div>
            {isLoadingTendencias ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : tendencias ? (
              <div className="flex items-center gap-1 mt-1">
                {tendencias.leads.tipo === 'positivo' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {tendencias.leads.tipo === 'negativo' && <TrendingDown className="h-3 w-3 text-red-600" />}
                <p className={`text-xs ${
                  tendencias.leads.tipo === 'positivo' ? 'text-green-600' : 
                  tendencias.leads.tipo === 'negativo' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {tendencias.leads.textoVariacao}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">-</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.taxaConversao)}%</div>
            {isLoadingTendencias ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : tendencias ? (
              <div className="flex items-center gap-1 mt-1">
                {tendencias.conversao.tipo === 'positivo' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {tendencias.conversao.tipo === 'negativo' && <TrendingDown className="h-3 w-3 text-red-600" />}
                <p className={`text-xs ${
                  tendencias.conversao.tipo === 'positivo' ? 'text-green-600' : 
                  tendencias.conversao.tipo === 'negativo' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {tendencias.conversao.textoVariacao}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">-</p>
            )}
          </CardContent>
        </Card>
      </div>

          {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar questionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="bem-estar">Bem-estar</TabsTrigger>
            <TabsTrigger value="lideranca">Liderança</TabsTrigger>
            <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

          {/* Questionários Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestionarios.map((questionario) => {
          return (
            <Card key={questionario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{questionario.titulo}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {questionario.descricao}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAtivo(questionario.id, questionario.ativo)}
                    title={questionario.ativo ? "Desativar" : "Ativar"}
                    className="shrink-0"
                  >
                    <Badge variant={questionario.ativo ? "default" : "secondary"}>
                      {questionario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{questionario.categoria}</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {questionario.total_questoes || 0} questões
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary truncate">
                      {questionario.total_respostas}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Respostas</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 truncate">
                      {questionario.leads_gerados}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Leads</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    Criado em {new Date(questionario.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/diagnosticos/editar/${questionario.id}`)}
                    disabled={loading === questionario.id}
                    className="flex-1 min-w-[80px]"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    <span className="text-xs">Editar</span>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate(`/diagnosticos/respostas/${questionario.id}`)}
                    className="flex-1 min-w-[110px]"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="text-xs">Respostas</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowQRCode(questionario.slug)}
                    className="min-w-[90px]"
                  >
                    <QrCode className="h-3 w-3 mr-1" />
                    <span className="text-xs">QR Code</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletarQuestionario(questionario.id)}
                    disabled={loading === questionario.id}
                    className="min-w-[80px] text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {loading === questionario.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs">Excluir</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

          {filteredQuestionarios.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum questionário encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "todos" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Comece criando seu primeiro questionário de diagnóstico"}
                </p>
                {!searchTerm && selectedCategory === "todos" && (
                  <Link to="/diagnosticos/criar">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Questionário
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      {/* QR Code Dialog */}
      <Dialog open={!!showQRCode} onOpenChange={(open) => !open && setShowQRCode(null)}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </DialogTitle>
            <DialogDescription>
              Compartilhe este questionário facilmente
            </DialogDescription>
          </DialogHeader>
          {showQRCode && (
            <QRCodeGenerator
              questionarioSlug={showQRCode}
              questionarioTitulo={filteredQuestionarios.find(q => q.slug === showQRCode)?.titulo || ""}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Questionário
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a excluir este questionário.
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                <p className="font-medium text-destructive mb-2">⚠️ Esta ação irá excluir permanentemente:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Todas as questões do questionário</li>
                  <li><strong>Todas as respostas recebidas</strong></li>
                  <li>Relatórios ROI associados</li>
                </ul>
              </div>
              <p className="text-destructive font-medium">
                Esta ação NÃO pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading === questionarioToDelete}
            >
              {loading === questionarioToDelete && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sim, excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Diagnosticos;