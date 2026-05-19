import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Download,
  Eye,
  Calendar,
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  FileText,
  Filter,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { useExportAvaliacao } from "@/hooks/useExportAvaliacao";

interface HistoricoAvaliacao {
  id: string;
  nome: string;
  empresa: string;
  tipo: string;
  participantes: number;
  participantesTotal: number;
  status: "concluida" | "em_andamento" | "pausada" | "cancelada";
  dataInicio: string;
  dataConclusao?: string;
  pontuacaoMedia: number;
  nivelRisco: "baixo" | "medio" | "alto";
  responsavel: string;
}

const Historico = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const { data: avaliacoes, isLoading } = useAvaliacoes();
  const { exportarCSV, exportarHistoricoCSV } = useExportAvaliacao();

  const historicoMock: HistoricoAvaliacao[] = [
    {
      id: "1",
      nome: "Avaliação Clima Q4 2023",
      empresa: "TechCorp Solutions",
      tipo: "Clima Organizacional",
      participantes: 145,
      participantesTotal: 150,
      status: "concluida",
      dataInicio: "2023-10-15",
      dataConclusao: "2023-11-30",
      pontuacaoMedia: 7.2,
      nivelRisco: "baixo",
      responsavel: "Dr. Ana Silva"
    },
    {
      id: "2", 
      nome: "Estresse Ocupacional - Vendas",
      empresa: "SalesMax Corp",
      tipo: "Estresse",
      participantes: 32,
      participantesTotal: 35,
      status: "concluida",
      dataInicio: "2023-11-20",
      dataConclusao: "2023-12-15",
      pontuacaoMedia: 6.8,
      nivelRisco: "medio",
      responsavel: "Dr. Carlos Mendes"
    },
    {
      id: "3",
      nome: "Engagement Equipe TI",
      empresa: "DevSoft Ltd",
      tipo: "Engagement",
      participantes: 28,
      participantesTotal: 30,
      status: "em_andamento",
      dataInicio: "2024-01-10",
      pontuacaoMedia: 7.5,
      nivelRisco: "baixo",
      responsavel: "Dr. Ana Silva"
    },
    {
      id: "4",
      nome: "Liderança Gerencial",
      empresa: "ManagePro Inc",
      tipo: "Liderança",
      participantes: 12,
      participantesTotal: 15,
      status: "pausada",
      dataInicio: "2024-02-01",
      pontuacaoMedia: 5.9,
      nivelRisco: "alto",
      responsavel: "Dr. Carlos Mendes"
    },
    {
      id: "5",
      nome: "Clima Pós-Mudança",
      empresa: "TransformCorp",
      tipo: "Clima Organizacional",
      participantes: 89,
      participantesTotal: 95,
      status: "concluida",
      dataInicio: "2023-12-01",
      dataConclusao: "2024-01-15",
      pontuacaoMedia: 6.3,
      nivelRisco: "medio",
      responsavel: "Dr. Ana Silva"
    }
  ];

  const historicoFiltrado = useMemo(() => {
    const items = avaliacoes || [];
    return items.filter((item: any) => {
      const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        (item.cliente?.nome || '').toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "todos" || item.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    });
  }, [avaliacoes, busca, filtroStatus, filtroTipo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "em_andamento":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "pausada":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "cancelada":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída";
      case "em_andamento":
        return "Em Andamento";
      case "pausada":
        return "Pausada";
      case "cancelada":
        return "Cancelada";
      default:
        return "Desconhecido";
    }
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case "baixo":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "medio":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "alto":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getRiscoLabel = (risco: string) => {
    switch (risco) {
      case "baixo":
        return "Baixo";
      case "medio":
        return "Médio";
      case "alto":
        return "Alto";
      default:
        return "N/A";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Avaliações</h1>
            <p className="text-muted-foreground">
              Visualize e analise todas as avaliações realizadas
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => exportarHistoricoCSV(historicoFiltrado)}
            disabled={historicoFiltrado.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar Histórico
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou empresa..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Clima Organizacional">Clima Organizacional</SelectItem>
                  <SelectItem value="Estresse">Estresse</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Liderança">Liderança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(busca || filtroStatus !== "todos" || filtroTipo !== "todos") && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setFiltroStatus("todos");
                    setFiltroTipo("todos");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {/* Histórico List */}
        {!isLoading && (
          <div className="space-y-4">
            {historicoFiltrado.map((item: any) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.nome}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      <Badge variant="outline">{item.tipo}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {item.cliente?.nome && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{item.cliente.nome}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{item.participantes_responderam || 0}/{item.participantes_total || 0} participantes</span>
                      </div>
                      {item.data_inicio && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Início: {new Date(item.data_inicio).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {item.data_fim && item.status === 'finalizada' && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Concluída: {new Date(item.data_fim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">Progresso: {item.progresso || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/relatorios/detalhado/${item.id}`)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => exportarCSV(item.id)}
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!isLoading && historicoFiltrado.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos avaliações que correspondam aos seus filtros.
              </p>
              <Button onClick={() => {
                setBusca("");
                setFiltroStatus("");
                setFiltroTipo("");
              }}>
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Historico;