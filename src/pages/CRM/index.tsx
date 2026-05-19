import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { CRMExplanation } from '@/components/crm/CRMExplanation';
import { NovaOportunidadeDialog } from '@/components/crm/NovaOportunidadeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Building2,
  Calendar,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Clock,
  Star,
  Tag,
  MessageSquare,
  History,
  ExternalLink,
  LayoutList,
  LayoutGrid,
  Download,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLeadsCRM, useLeadCreate } from '@/hooks/useLeadsCRM';
import { useOportunidadesCRM, useOportunidadeUpdate } from '@/hooks/useOportunidadesCRM';
import { useLeadAnotacoes, useLeadAnotacaoCreate } from '@/hooks/useLeadAnotacoes';
import { useLeadHistorico } from '@/hooks/useLeadHistorico';
import { useExportLeads } from '@/hooks/useExportLeads';
import { useFollowupAlerts } from '@/hooks/useFollowupAlerts';
import { useClientes } from '@/hooks/useClientes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCpfCnpj, isValidCpfCnpj } from '@/lib/cpf-cnpj-validator';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { ConversionCharts } from '@/components/crm/ConversionCharts';
import { LeadTimeline } from '@/components/crm/LeadTimeline';
import { LeadActions } from '@/components/crm/LeadActions';
import { LeadEventos } from '@/components/crm/LeadEventos';
import { LeadOrigemBadge } from '@/components/crm/LeadOrigemBadge';
import { DuplicateLeadDialog } from '@/components/crm/DuplicateLeadDialog';
import { FollowupAlertsPanel } from '@/components/crm/FollowupAlertsPanel';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'novo':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'contatado':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'qualificado':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case 'negociacao':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'convertido':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'perdido':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    novo: 'Novo',
    contatado: 'Contatado',
    qualificado: 'Qualificado',
    negociacao: 'Em Negociação',
    convertido: 'Convertido',
    perdido: 'Perdido',
  };
  return labels[status] || status;
};

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'alta':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'media':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'baixa':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

const novoLeadSchema = z.object({
  nome: z.string().min(1, 'Nome da empresa é obrigatório'),
  responsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  cpf_cnpj: z.string().optional(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  colaboradores: z.coerce.number().min(0, 'Número de colaboradores inválido'),
  tipo: z.string().min(1, 'Tipo de empresa é obrigatório'),
  cargo: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  valorPotencial: z.number().min(0).optional(),
  origem: z.enum(['diagnostico', 'manual', 'website', 'indicacao']).optional(),
  categoria: z.enum(['quente', 'morno', 'frio']).optional(),
  observacoes: z.string().optional(),
});

const anotacaoSchema = z.object({
  texto: z.string().min(1, 'Anotação não pode estar vazia'),
});

export default function CRM() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Usar hook de persistência de filtros
  const { filters, setFilters, clearSearchAndFilters } = useFilterPersistence();
  const { busca, filtroStatus, filtroOrigem, filtroValor, filtroPeriodo, viewMode } = filters;

  // Detectar estado de navegação para aplicar viewMode inicial
  useEffect(() => {
    if ((location.state as any)?.viewMode) {
      setFilters({ viewMode: (location.state as any).viewMode });
    }
  }, [location.state]);
  
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [dialogNovoLead, setDialogNovoLead] = useState(false);
  const [dialogNovaOportunidade, setDialogNovaOportunidade] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [dialogAgendar, setDialogAgendar] = useState(false);
  const [dialogDuplicado, setDialogDuplicado] = useState(false);
  const [leadDuplicado, setLeadDuplicado] = useState<any>(null);
  const [leadSelecionado, setLeadSelecionado] = useState<any>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [pendingMoves, setPendingMoves] = useState<Set<string>>(new Set());
  const ITENS_POR_PAGINA = 20;
  const [agendamentoData, setAgendamentoData] = useState({
    titulo: '',
    data_hora: new Date(),
    tipo: 'follow_up' as const,
    local: '',
  });

  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useLeadsCRM();
  const { data: oportunidades = [], isLoading: isLoadingOportunidades } = useOportunidadesCRM();
  const { data: clientesRaw = [], isLoading: isLoadingClientes } = useClientes();

  const clientesFiltrados = useMemo(() => {
    return clientesRaw.filter((cliente) => {
      // Filtrar inativos por padrão na aba "Clientes Ativos"
      if (cliente.status?.toLowerCase() === 'inativo') return false;

      // Aplicar filtro de busca
      if (busca) {
        const buscaLower = busca.toLowerCase();
        const matchNome = cliente.nome?.toLowerCase().includes(buscaLower);
        const matchEmail = cliente.email?.toLowerCase().includes(buscaLower);
        const matchResponsavel = cliente.responsavel?.toLowerCase().includes(buscaLower);
        if (!matchNome && !matchEmail && !matchResponsavel) return false;
      }

      return true;
    });
  }, [clientesRaw, busca]);
  const createLead = useLeadCreate();
  const updateOportunidade = useOportunidadeUpdate();
  const createAnotacao = useLeadAnotacaoCreate();
  const { exportToCSV } = useExportLeads();
  const { data: anotacoes = [] } = useLeadAnotacoes(leadSelecionado?.id || '');
  const { data: historico = [] } = useLeadHistorico(leadSelecionado?.id || '');
  const { totalPendentes } = useFollowupAlerts();

  const [novoLeadData, setNovoLeadData] = useState({
    nome: '',
    responsavel: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    colaboradores: 0,
    tipo: '',
    cargo: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    valorPotencial: 0,
    origem: 'manual' as 'diagnostico' | 'manual' | 'website' | 'indicacao',
    categoria: 'frio' as 'quente' | 'morno' | 'frio',
    observacoes: '',
  });

  // Estado para contatos adicionais
  const [contatosAdicionais, setContatosAdicionais] = useState<Array<{
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
  }>>([]);

  const [novaAnotacao, setNovaAnotacao] = useState('');

  // Filtrar leads (remover filtro de status que não existe mais)
  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead: any) => {
      const matchBusca =
        lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(busca.toLowerCase())) ||
        lead.empresa?.toLowerCase().includes(busca.toLowerCase());

      const matchOrigem = filtroOrigem === 'todos' || lead.origem === filtroOrigem;
      
      const matchValor =
        lead.valor_potencial >= filtroValor[0] && lead.valor_potencial <= filtroValor[1];

      let matchPeriodo = true;
      if (filtroPeriodo.start && filtroPeriodo.end) {
        const leadDate = new Date(lead.created_at);
        matchPeriodo = leadDate >= filtroPeriodo.start && leadDate <= filtroPeriodo.end;
      }

      return matchBusca && matchOrigem && matchValor && matchPeriodo;
    });
  }, [leads, busca, filtroOrigem, filtroValor, filtroPeriodo]);

  const leadsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return leadsFiltrados.slice(inicio, fim);
  }, [leadsFiltrados, paginaAtual]);

  const totalPaginas = Math.ceil(leadsFiltrados.length / ITENS_POR_PAGINA);

  // Calcular estatísticas baseadas em oportunidades
  const estatisticas = useMemo(() => {
    const oportunidadesAbertas = oportunidades.filter((o: any) => 
      !['ganho', 'perdido'].includes(o.estagio)
    );
    
    return {
      total: leadsFiltrados.length,
      oportunidadesAbertas: oportunidadesAbertas.length,
      oportunidadesGanhas: oportunidades.filter((o: any) => o.estagio === 'ganho').length,
      oportunidadesPerdidas: oportunidades.filter((o: any) => o.estagio === 'perdido').length,
      valorTotal: oportunidadesAbertas.reduce((sum: number, o: any) => 
        sum + (o.valor_estimado || 0), 0
      ),
      taxaConversao: oportunidades.length > 0 
        ? ((oportunidades.filter((o: any) => o.estagio === 'ganho').length / oportunidades.length) * 100).toFixed(1)
        : '0',
    };
  }, [leadsFiltrados, oportunidades]);

  const handleSalvarNovoLead = async () => {
    try {
      // Validar CPF/CNPJ se fornecido
      if (novoLeadData.cpf_cnpj && !isValidCpfCnpj(novoLeadData.cpf_cnpj)) {
        toast({
          title: 'CPF ou CNPJ inválido',
          description: 'Por favor, verifique o CPF ou CNPJ informado.',
          variant: 'destructive',
        });
        return;
      }

      const validated = novoLeadSchema.parse(novoLeadData);
      
      setIsCreatingLead(true);
      
      try {
        const lead = await createLead.mutateAsync({
          ...validated,
          origem: validated.origem || 'manual',
          categoria: validated.categoria || 'frio',
          score: 0,
          contatosAdicionais,
        });

        setDialogNovoLead(false);
        setNovoLeadData({
          nome: '',
          responsavel: '',
          email: '',
          telefone: '',
          cpf_cnpj: '',
          endereco: '',
          colaboradores: 0,
          tipo: '',
          cargo: '',
          prioridade: 'media',
          valorPotencial: 0,
          origem: 'manual' as 'diagnostico' | 'manual' | 'website' | 'indicacao',
          categoria: 'frio' as 'quente' | 'morno' | 'frio',
          observacoes: '',
        });
        setContatosAdicionais([]);
      } finally {
        setIsCreatingLead(false);
      }
    } catch (error: any) {
      setIsCreatingLead(false);
      if (error.duplicate) {
        setLeadDuplicado(error.duplicate);
        setDialogDuplicado(true);
      } else {
        toast({
          title: 'Erro ao criar lead',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddAnotacao = async () => {
    if (!leadSelecionado) return;

    try {
      anotacaoSchema.parse({ texto: novaAnotacao });
      await createAnotacao.mutateAsync({
        leadId: leadSelecionado.id,
        texto: novaAnotacao,
      });
      setNovaAnotacao('');
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar anotação',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEstagioChange = async (oportunidadeId: string, newEstagio: string) => {
    setPendingMoves(prev => new Set([...prev, oportunidadeId]));
    
    try {
      await updateOportunidade.mutateAsync({ id: oportunidadeId, estagio: newEstagio });
    } finally {
      setPendingMoves(prev => {
        const next = new Set(prev);
        next.delete(oportunidadeId);
        return next;
      });
    }
  };

  const handleExportar = () => {
    exportToCSV(leadsFiltrados, `leads-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleAbrirDetalhes = (item: any) => {
    const leadId = item.lead?.id || item.id;
    navigate(`/crm/${leadId}`);
  };

  const handleAgendar = (lead: any) => {
    setLeadSelecionado(lead);
    setAgendamentoData({
      titulo: `Follow-up com ${lead.nome}`,
      data_hora: new Date(),
      tipo: 'follow_up',
      local: '',
    });
    setDialogAgendar(true);
  };

  const { effectiveUserId } = useAuth();

  const handleSalvarAgendamento = async () => {
    if (!leadSelecionado) return;

    try {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const userId = effectiveUserId;

      // Criar evento
      const { error: eventoError } = await supabase
        .from('eventos')
        .insert({
          consultora_id: userId,
          cliente_id: null,
          lead_id: leadSelecionado.id,
          titulo: agendamentoData.titulo,
          data_hora: agendamentoData.data_hora.toISOString(),
          tipo: agendamentoData.tipo,
          local: agendamentoData.local,
          status: 'agendado',
        });

      if (eventoError) throw eventoError;

      // Registrar no histórico
      await supabase.from('leads_historico').insert({
        lead_id: leadSelecionado.id,
        tipo: 'follow_up_agendado',
        descricao: `Follow-up agendado para ${format(agendamentoData.data_hora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      });

      toast({
        title: 'Agendamento criado',
        description: 'Follow-up foi agendado com sucesso.',
      });

      setDialogAgendar(false);
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
    } catch (error: any) {
      toast({
        title: 'Erro ao agendar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">CRM - Pipeline de Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie leads e acompanhe oportunidades de negócio
              {totalPendentes > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalPendentes} follow-up{totalPendentes > 1 ? 's' : ''} pendente{totalPendentes > 1 ? 's' : ''}
                </Badge>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSearchAndFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportar}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Dialog open={dialogNovoLead} onOpenChange={setDialogNovoLead}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                  <DialogDescription>
                    Preencha todas as informações do lead e da empresa
                  </DialogDescription>
                </DialogHeader>
                
                {/* Overlay de loading */}
                {isCreatingLead && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-fade-in rounded-lg">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                      <Users className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-medium">Criando lead...</p>
                      <p className="text-sm text-muted-foreground">Configurando oportunidade e contatos</p>
                    </div>
                  </div>
                )}
                
                 <div className="flex-1 overflow-y-auto pr-2">
                   <div className="grid gap-4">
                     <div className="space-y-4">
                    <h3 className="font-medium text-sm">Dados da Empresa</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Empresa *</Label>
                        <Input
                          id="nome"
                          value={novoLeadData.nome}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, nome: e.target.value })
                          }
                          placeholder="Ex: Acme Ltda"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Empresa *</Label>
                        <Select
                          value={novoLeadData.tipo}
                          onValueChange={(value) =>
                            setNovoLeadData({ ...novoLeadData, tipo: value })
                          }
                        >
                          <SelectTrigger id="tipo">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Corporativo">Corporativo</SelectItem>
                            <SelectItem value="Individual">Individual</SelectItem>
                            <SelectItem value="Startup">Startup</SelectItem>
                            <SelectItem value="PME">PME</SelectItem>
                            <SelectItem value="ONG">ONG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <Input
                          id="endereco"
                          value={novoLeadData.endereco}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, endereco: e.target.value })
                          }
                          placeholder="Endereço completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colaboradores">Colaboradores *</Label>
                        <Input
                          id="colaboradores"
                          type="number"
                          min="0"
                          value={novoLeadData.colaboradores}
                          onChange={(e) =>
                            setNovoLeadData({
                              ...novoLeadData,
                              colaboradores: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Número de colaboradores"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Contato Principal</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="responsavel">Nome do Responsável *</Label>
                        <Input
                          id="responsavel"
                          value={novoLeadData.responsavel}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, responsavel: e.target.value })
                          }
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          value={novoLeadData.cargo}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, cargo: e.target.value })
                          }
                          placeholder="Ex: Diretor de RH"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={novoLeadData.email}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, email: e.target.value })
                          }
                          placeholder="email@empresa.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          ⚠️ Sem email: envio de e-mail e verificação automática de duplicatas ficam indisponíveis
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          value={novoLeadData.telefone}
                          onChange={(e) =>
                            setNovoLeadData({ ...novoLeadData, telefone: e.target.value })
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="cpf_cnpj">CPF ou CNPJ</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-xs">
                                ?
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Necessário para emissão de faturas quando o lead virar cliente.
                                Pode ser preenchido depois.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="cpf_cnpj"
                        value={novoLeadData.cpf_cnpj}
                        onChange={(e) => {
                          const formatted = formatCpfCnpj(e.target.value);
                          setNovoLeadData({ ...novoLeadData, cpf_cnpj: formatted });
                        }}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        maxLength={18}
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Necessário para emitir faturas. Pode ser preenchido depois.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Qualificação do Lead</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prioridade">Prioridade</Label>
                        <Select
                          value={novoLeadData.prioridade}
                          onValueChange={(value: 'baixa' | 'media' | 'alta') =>
                            setNovoLeadData({ ...novoLeadData, prioridade: value })
                          }
                        >
                          <SelectTrigger id="prioridade">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="valorPotencial">Valor Potencial</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs">
                                  ?
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Estimativa de receita que este lead pode gerar se convertido em cliente. Ajuda a priorizar leads com maior potencial de retorno.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="valorPotencial"
                          type="number"
                          min="0"
                          value={novoLeadData.valorPotencial}
                          onChange={(e) =>
                            setNovoLeadData({
                              ...novoLeadData,
                              valorPotencial: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="R$ 0,00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Select
                          value={novoLeadData.categoria}
                          onValueChange={(value) =>
                            setNovoLeadData({ ...novoLeadData, categoria: value as 'quente' | 'morno' | 'frio' })
                          }
                        >
                          <SelectTrigger id="categoria">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quente">🔥 Quente</SelectItem>
                            <SelectItem value="morno">☕ Morno</SelectItem>
                            <SelectItem value="frio">❄️ Frio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem *</Label>
                      <Select
                        value={novoLeadData.origem}
                        onValueChange={(value) =>
                          setNovoLeadData({ ...novoLeadData, origem: value as 'diagnostico' | 'manual' | 'website' | 'indicacao' })
                        }
                      >
                        <SelectTrigger id="origem">
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diagnostico">📊 Diagnóstico</SelectItem>
                          <SelectItem value="manual">✍️ Manual</SelectItem>
                          <SelectItem value="website">🌐 Website</SelectItem>
                          <SelectItem value="indicacao">👥 Indicação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={novoLeadData.observacoes}
                        onChange={(e) =>
                          setNovoLeadData({
                            ...novoLeadData,
                            observacoes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Anotações sobre o lead"
                      />
                    </div>
                  </div>

                  {/* Contatos Adicionais */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Contatos Adicionais</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setContatosAdicionais([...contatosAdicionais, { nome: '', cargo: '', email: '', telefone: '' }])}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Contato
                      </Button>
                    </div>
                    
                    {contatosAdicionais.length > 0 && (
                      <div className="space-y-4">
                        {contatosAdicionais.map((contato, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-sm font-medium">Contato {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const novosContatos = contatosAdicionais.filter((_, i) => i !== index);
                                  setContatosAdicionais(novosContatos);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                  value={contato.nome}
                                  onChange={(e) => {
                                    const novosContatos = [...contatosAdicionais];
                                    novosContatos[index].nome = e.target.value;
                                    setContatosAdicionais(novosContatos);
                                  }}
                                  placeholder="Nome do contato"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Input
                                  value={contato.cargo}
                                  onChange={(e) => {
                                    const novosContatos = [...contatosAdicionais];
                                    novosContatos[index].cargo = e.target.value;
                                    setContatosAdicionais(novosContatos);
                                  }}
                                  placeholder="Cargo"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={contato.email}
                                  onChange={(e) => {
                                    const novosContatos = [...contatosAdicionais];
                                    novosContatos[index].email = e.target.value;
                                    setContatosAdicionais(novosContatos);
                                  }}
                                  placeholder="email@empresa.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                  value={contato.telefone}
                                  onChange={(e) => {
                                    const novosContatos = [...contatosAdicionais];
                                    novosContatos[index].telefone = e.target.value;
                                    setContatosAdicionais(novosContatos);
                                  }}
                                  placeholder="(00) 00000-0000"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {contatosAdicionais.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum contato adicional. Clique em "Adicionar Contato" para incluir mais pessoas.
                      </p>
                    )}
                  </div>
                  </div>
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button onClick={handleSalvarNovoLead} disabled={createLead.isPending} className="w-full">
                    {createLead.isPending ? 'Salvando...' : 'Salvar Lead'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setDialogNovaOportunidade(true)}>
              <Target className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* Explicação do CRM */}
        <CRMExplanation />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Contatos em processo de vendas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oportunidades Abertas</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.oportunidadesAbertas}</div>
              <p className="text-xs text-muted-foreground mt-1">Negócios ativos no pipeline</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.oportunidadesGanhas}</div>
              <p className="text-xs text-muted-foreground mt-1">Oportunidades fechadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perdidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.oportunidadesPerdidas}</div>
              <p className="text-xs text-muted-foreground mt-1">Oportunidades não fechadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Potencial</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {estatisticas.valorTotal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Soma de oportunidades abertas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.taxaConversao}%</div>
              <p className="text-xs text-muted-foreground mt-1">Oportunidades ganhas</p>
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Alerts Panel */}
        <FollowupAlertsPanel />

        {/* View Mode Selector */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ScrollArea className="w-full lg:w-auto">
            <div className="flex items-center gap-2 pb-2 lg:pb-0">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ viewMode: 'list' })}
              >
                <LayoutList className="h-4 w-4 mr-2" />
                Lista de Leads
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ viewMode: 'kanban' })}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban de Oportunidades
                <Badge variant="outline" className="ml-2 text-xs">Pipeline</Badge>
              </Button>
              <Button
                variant={viewMode === 'clientes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ viewMode: 'clientes' })}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Clientes Ativos
                <Badge variant="outline" className="ml-2 text-xs">
                  {clientesFiltrados.length}
                </Badge>
              </Button>
              <Button
                variant={viewMode === 'charts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ viewMode: 'charts' })}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Gráficos
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
            className="lg:ml-4"
          >
            <Sliders className="h-4 w-4 mr-2" />
            {mostrarFiltrosAvancados ? 'Ocultar' : 'Filtros Avançados'}
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                className="pl-10"
                value={busca}
                onChange={(e) => setFilters({ busca: e.target.value })}
              />
            </div>
            <Select value={filtroStatus} onValueChange={(value) => setFilters({ filtroStatus: value })}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="contatado">Contatado</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="negociacao">Em Negociação</SelectItem>
                <SelectItem value="convertido">Convertido</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroOrigem} onValueChange={(value) => setFilters({ filtroOrigem: value })}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as origens</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros Avançados */}
          {mostrarFiltrosAvancados && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filtros Avançados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Valor Potencial</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      R$ {filtroValor[0].toLocaleString('pt-BR')}
                    </span>
                    <Slider
                      value={filtroValor}
                      onValueChange={(value) => setFilters({ filtroValor: value as [number, number] })}
                      max={100000}
                      step={1000}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      R$ {filtroValor[1].toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filtroPeriodo.start
                            ? format(filtroPeriodo.start, 'dd/MM/yyyy', { locale: ptBR })
                            : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filtroPeriodo.start}
                          onSelect={(date) =>
                            setFilters({ filtroPeriodo: { ...filtroPeriodo, start: date } })
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filtroPeriodo.end
                            ? format(filtroPeriodo.end, 'dd/MM/yyyy', { locale: ptBR })
                            : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filtroPeriodo.end}
                          onSelect={(date) =>
                            setFilters({ filtroPeriodo: { ...filtroPeriodo, end: date } })
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ filtroValor: [0, 100000], filtroPeriodo: {} });
                  }}
                >
                  Limpar Filtros Avançados
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content by View Mode */}
        {viewMode === 'charts' && (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gráficos de conversão em desenvolvimento</p>
          </div>
        )}

        {viewMode === 'kanban' && (
          isLoadingOportunidades ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <KanbanBoard
              oportunidades={oportunidades}
              onEstagioChange={handleEstagioChange}
              onOportunidadeClick={handleAbrirDetalhes}
              pendingMoves={pendingMoves}
            />
          )
        )}

        {viewMode === 'clientes' && (
          <Card>
            <CardHeader>
              <CardTitle>Clientes Ativos</CardTitle>
              <CardDescription>
                Clientes que já fecharam negócio e estão ativos no seu portfólio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingClientes ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-2">Nenhum cliente ativo</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Converta leads em clientes ao ganhar oportunidades
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ viewMode: 'list' })}
                  >
                    Ver Leads
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {clientesFiltrados.map((cliente) => (
                    <Card 
                      key={cliente.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {cliente.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                              {cliente.responsavel && (
                                <p className="text-sm text-muted-foreground">
                                  {cliente.responsavel}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(cliente.status)}>
                            {cliente.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{cliente.email || 'Sem email'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{cliente.telefone || 'Sem telefone'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{cliente.colaboradores} colaboradores</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Última avaliação: 
                              <span className="text-foreground ml-1">
                                {cliente.ultima_avaliacao 
                                  ? format(new Date(cliente.ultima_avaliacao), 'dd/MM/yyyy', { locale: ptBR })
                                  : 'N/A'
                                }
                              </span>
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Risco: {cliente.risco_atual || 0}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === 'list' && (
          <>
            {/* Leads List */}
            <div className="grid gap-4">
              {leadsPaginados.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground text-center">
                      Nenhum lead encontrado com os filtros aplicados
                    </p>
                  </CardContent>
                </Card>
              ) : (
                leadsPaginados.map((lead: any) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAbrirDetalhes(lead)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{lead.nome}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className={getStatusColor(lead.status_crm)}>
                                  {getStatusLabel(lead.status_crm)}
                                </Badge>
                                <Badge className={getPrioridadeColor(lead.prioridade)}>
                                  {lead.prioridade}
                                </Badge>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="cursor-help">
                                        Score: {lead.score}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">Como o Score é calculado?</p>
                                      {lead.origem === 'diagnostico' ? (
                                        <p className="text-sm">
                                          Este score (0-100) foi calculado automaticamente com base nas respostas do 
                                          diagnóstico. Cada questão tem um <strong>peso</strong> (1-10) que determina 
                                          sua importância no cálculo final.
                                        </p>
                                      ) : (
                                        <p className="text-sm">
                                          Leads criados manualmente começam com score 0. Você pode editá-lo 
                                          conforme avalia a qualidade do lead através das interações.
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <LeadOrigemBadge lead={lead} />
                              </div>
                            </div>
                            {lead.valor_potencial > 0 && (
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">
                                  Valor Potencial
                                </div>
                                <div className="text-lg font-bold text-primary">
                                  R$ {lead.valor_potencial.toLocaleString('pt-BR')}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {lead.email ? (
                                <span className="truncate">{lead.email}</span>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Sem email</Badge>
                              )}
                            </div>
                            {lead.telefone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{lead.telefone}</span>
                              </div>
                            )}
                            {lead.empresa && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span className="truncate">{lead.empresa}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Tag className="h-4 w-4" />
                              <span>{lead.categoria}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              <span>{lead.origem}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Dialog de Agendamento */}
        <Dialog open={dialogAgendar} onOpenChange={setDialogAgendar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Follow-up</DialogTitle>
              <DialogDescription>
                Agende um próximo contato com {leadSelecionado?.nome}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={agendamentoData.titulo}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, titulo: e.target.value })}
                  placeholder="Ex: Apresentação de proposta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_hora">Data e Hora</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(agendamentoData.data_hora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={agendamentoData.data_hora}
                      onSelect={(date) => date && setAgendamentoData({ ...agendamentoData, data_hora: date })}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Label htmlFor="hora">Horário</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={format(agendamentoData.data_hora, 'HH:mm')}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(agendamentoData.data_hora);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setAgendamentoData({ ...agendamentoData, data_hora: newDate });
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={agendamentoData.tipo}
                  onValueChange={(value) => setAgendamentoData({ ...agendamentoData, tipo: value as 'follow_up' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                    <SelectItem value="apresentacao">Apresentação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local (opcional)</Label>
                <Input
                  id="local"
                  value={agendamentoData.local}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, local: e.target.value })}
                  placeholder="Ex: Escritório do cliente, Google Meet, etc."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAgendar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarAgendamento}>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalhes do Lead */}
        <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {leadSelecionado && (
              <>
                <DialogHeader>
                  <DialogTitle>{leadSelecionado.nome}</DialogTitle>
                  <DialogDescription>
                    Lead gerado via {leadSelecionado.origem} em{' '}
                    {format(new Date(leadSelecionado.created_at), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="eventos">Eventos</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Ações Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <LeadActions
                          lead={leadSelecionado}
                          onAgendar={() => handleAgendar(leadSelecionado)}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informações do Lead</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{leadSelecionado.email}</p>
                          </div>
                          {leadSelecionado.telefone && (
                            <div>
                              <Label className="text-muted-foreground">Telefone</Label>
                              <p className="font-medium">{leadSelecionado.telefone}</p>
                            </div>
                          )}
                          {leadSelecionado.empresa && (
                            <div>
                              <Label className="text-muted-foreground">Empresa</Label>
                              <p className="font-medium">{leadSelecionado.empresa}</p>
                            </div>
                          )}
                          {leadSelecionado.cargo && (
                            <div>
                              <Label className="text-muted-foreground">Cargo</Label>
                              <p className="font-medium">{leadSelecionado.cargo}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-muted-foreground">Prioridade</Label>
                            <Badge className={getPrioridadeColor(leadSelecionado.prioridade)}>
                              {leadSelecionado.prioridade}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Score</Label>
                            <p className="font-medium">{leadSelecionado.score}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Categoria</Label>
                            <p className="font-medium">{leadSelecionado.categoria}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Valor Potencial</Label>
                            <p className="font-medium">
                              R$ {leadSelecionado.valor_potencial?.toLocaleString('pt-BR') || 0}
                            </p>
                          </div>
                        </div>

                        {leadSelecionado.observacoes && (
                          <div>
                            <Label className="text-muted-foreground">Observações</Label>
                            <p className="text-sm mt-1">{leadSelecionado.observacoes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="eventos">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Eventos e Agendamentos</CardTitle>
                        <CardDescription>
                          Gerencie todos os eventos relacionados a este lead
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LeadEventos leadId={leadSelecionado.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Timeline do Lead</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <LeadTimeline historico={historico} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="historico">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Histórico de Atividades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {historico.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhuma atividade registrada
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {historico.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex gap-4 pb-4 border-b last:border-0"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{item.tipo}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(item.data || item.created_at),
                                        "dd/MM/yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-sm">{item.descricao}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="anotacoes">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Anotações</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Digite sua anotação..."
                            value={novaAnotacao}
                            onChange={(e) => setNovaAnotacao(e.target.value)}
                            rows={3}
                          />
                          <Button
                            onClick={handleAddAnotacao}
                            disabled={createAnotacao.isPending}
                            size="sm"
                          >
                            {createAnotacao.isPending ? 'Salvando...' : 'Adicionar Anotação'}
                          </Button>
                        </div>

                        {anotacoes.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhuma anotação ainda
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {anotacoes.map((anotacao: any) => (
                              <Card key={anotacao.id}>
                                <CardContent className="p-4">
                                  <p className="text-sm mb-2">{anotacao.texto}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(anotacao.created_at),
                                      "dd/MM/yyyy 'às' HH:mm",
                                      { locale: ptBR }
                                    )}
                                  </span>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Lead Duplicado */}
        <DuplicateLeadDialog
          open={dialogDuplicado}
          onOpenChange={setDialogDuplicado}
          existingLead={leadDuplicado}
          onCreateAnyway={async () => {
            try {
              const validated = novoLeadSchema.parse(novoLeadData);
              await createLead.mutateAsync({ ...validated, score: 0 });
              setDialogNovoLead(false);
              setNovoLeadData({
                nome: '', 
                responsavel: '', 
                email: '', 
                telefone: '', 
                cpf_cnpj: '',
                endereco: '', 
                colaboradores: 0, 
                tipo: '', 
                cargo: '', 
                prioridade: 'media', 
                valorPotencial: 0, 
                origem: 'manual' as 'diagnostico' | 'manual' | 'website' | 'indicacao', 
                categoria: 'frio' as 'quente' | 'morno' | 'frio', 
                observacoes: '',
              });
            } catch (error: any) {
              toast({ title: 'Erro ao criar lead', description: error.message, variant: 'destructive' });
            }
          }}
        />
      
        {/* Dialog Nova Oportunidade */}
        <NovaOportunidadeDialog
          open={dialogNovaOportunidade}
          onOpenChange={setDialogNovaOportunidade}
        />
      </div>
    </MainLayout>
  );
}
