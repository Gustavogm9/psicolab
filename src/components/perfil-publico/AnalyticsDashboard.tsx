import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { usePerfilPublicoAnalytics } from '@/hooks/usePerfilPublicoAnalytics';
import { usePerfilPublicoLeads, useUpdatePerfilPublicoLead } from '@/hooks/usePerfilPublicoLeads';
import { useDominiosCustomizados } from '@/hooks/useDominiosCustomizados';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalyticsPeriodFilter, PeriodFilter } from './AnalyticsPeriodFilter';
import { DomainTrafficComparison } from './DomainTrafficComparison';

interface AnalyticsDashboardProps {
  perfilPublicoId: string;
}

export const AnalyticsDashboard = ({ perfilPublicoId }: AnalyticsDashboardProps) => {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  
  const periodoDias = period === 'all' ? undefined : parseInt(period);
  const { data: analytics, isLoading: loadingAnalytics } = usePerfilPublicoAnalytics(perfilPublicoId, periodoDias);
  const { data: leadsData, isLoading: loadingLeads } = usePerfilPublicoLeads(perfilPublicoId);
  const { data: dominios = [] } = useDominiosCustomizados(perfilPublicoId);
  const updateLead = useUpdatePerfilPublicoLead();

  const temDominioAtivo = dominios.some(d => d.status === 'ativo');

  if (loadingAnalytics || loadingLeads) {
    return <div className="text-center py-8">Carregando analytics...</div>;
  }

  const handleUpdateLeadStatus = (leadId: string, status: 'novo' | 'contatado' | 'convertido' | 'perdido') => {
    updateLead.mutate({ leadId, status });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      novo: { variant: 'default' as const, icon: AlertCircle, label: 'Novo', className: '' },
      contatado: { variant: 'secondary' as const, icon: Clock, label: 'Contatado', className: '' },
      convertido: { variant: 'default' as const, icon: CheckCircle2, label: 'Convertido', className: 'bg-green-500' },
      perdido: { variant: 'destructive' as const, icon: XCircle, label: 'Perdido', className: '' },
    };
    
    const config = styles[status as keyof typeof styles] || styles.novo;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex justify-end">
        <AnalyticsPeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitas Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metricas.totalVisitas || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === '7d' && 'Últimos 7 dias'}
              {period === '30d' && 'Últimos 30 dias'}
              {period === '90d' && 'Últimos 90 dias'}
              {period === 'all' && 'Todo o período'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads Capturados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsData?.metricas.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {leadsData?.metricas.novos || 0} novos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsData?.metricas.taxaConversao || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {leadsData?.metricas.convertidos || 0} convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cliques WhatsApp</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metricas.totalCliquesWhatsApp || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Contatos diretos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhamento */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="dominio">Por Domínio</TabsTrigger>
          <TabsTrigger value="origem">Por Origem</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads Recentes</CardTitle>
              <CardDescription>Gerencie os leads capturados via sua página pública</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsData?.leads && leadsData.leads.length > 0 ? (
                <div className="space-y-4">
                  {leadsData.leads.map((lead) => (
                    <Card key={lead.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{lead.nome}</h4>
                            {getStatusBadge(lead.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                            {lead.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.telefone}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(lead.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      {lead.mensagem && (
                        <p className="text-sm mb-3 p-3 bg-muted rounded-md">{lead.mensagem}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {lead.origem === 'formulario_contato' && 'Formulário de Contato'}
                          {lead.origem === 'diagnostico' && 'Diagnóstico'}
                          {lead.origem === 'widget_servico' && 'Widget de Serviço'}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {lead.status === 'novo' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateLeadStatus(lead.id, 'contatado')}
                            >
                              Marcar como Contatado
                            </Button>
                          )}
                          {lead.status === 'contatado' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateLeadStatus(lead.id, 'convertido')}
                              >
                                Convertido
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateLeadStatus(lead.id, 'perdido')}
                              >
                                Perdido
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum lead capturado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominio" className="space-y-4">
          <DomainTrafficComparison 
            perfilPublicoId={perfilPublicoId}
            periodoDias={periodoDias}
            temDominioAtivo={temDominioAtivo}
          />
        </TabsContent>

        <TabsContent value="origem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads por Origem</CardTitle>
              <CardDescription>Distribuição de leads por canal de captura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(leadsData?.metricas.porOrigem || {}).map(([origem, count]) => (
                  <div key={origem} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {origem === 'formulario_contato' && 'Formulário de Contato'}
                      {origem === 'diagnostico' && 'Diagnóstico'}
                      {origem === 'widget_servico' && 'Widget de Serviço'}
                    </span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
