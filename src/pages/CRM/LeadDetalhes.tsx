import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, CheckCircle, Building2, Info, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLeadsCRM, useLeadDelete } from "@/hooks/useLeadsCRM";
import { LeadTimeline } from "@/components/crm/LeadTimeline";
import { LeadActions } from "@/components/crm/LeadActions";
import { LeadInteracoes } from "@/components/crm/LeadInteracoes";
import { LeadOportunidades } from "@/components/crm/LeadOportunidades";
import { LeadEventos } from "@/components/crm/LeadEventos";
import { LeadOrigemBadge } from "@/components/crm/LeadOrigemBadge";
import { LeadAnotacoesSection } from "@/components/crm/LeadAnotacoesSection";
import { LeadEditDialog } from "@/components/crm/LeadEditDialog";
import { AgendarEventoDialog } from "@/components/crm/AgendarEventoDialog";
import { LeadContatosManager } from "@/components/crm/LeadContatosManager";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LeadDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: leads, isLoading } = useLeadsCRM();
  const deleteLead = useLeadDelete();
  
  const [dialogEdit, setDialogEdit] = useState(false);
  const [dialogAgendar, setDialogAgendar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando detalhes do lead...</p>
        </div>
      </MainLayout>
    );
  }

  const lead = leads?.find(l => l.id === id);

  if (!lead) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-muted-foreground">Lead não encontrado.</p>
          <Button onClick={() => navigate('/crm')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para CRM
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/crm')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{lead.nome}</h1>
              <p className="text-muted-foreground">
                {lead.email || '(Sem email cadastrado)'}
              </p>
              {!lead.email && (
                <Badge variant="secondary" className="mt-1">
                  Sem email
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDialogEdit(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDialogAgendar(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Agendar
            </Button>
            {lead.cliente_id && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/clientes/${lead.cliente_id}`)}>
                <Building2 className="mr-2 h-4 w-4" />
                Gerenciar Cliente
              </Button>
            )}
          </div>
        </div>

        {/* Alert para Lead Convertido */}
        {lead.cliente_id && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Lead Convertido em Cliente</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              Este lead foi convertido em cliente ativo. As oportunidades agora são gerenciadas na página do cliente.
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
                onClick={() => navigate(`/clientes/${lead.cliente_id}`)}
              >
                Ver Página do Cliente →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Origem e Status */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <LeadOrigemBadge lead={lead} />
              {lead.cliente_id && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cliente Ativo
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{lead.empresa || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-medium">{lead.cargo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{lead.telefone || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-2">📊 Entendendo o Score</p>
                        {lead.origem === 'diagnostico' ? (
                          <>
                            <p className="text-sm mb-2">
                              <strong>Score Automático:</strong> Este lead veio de um diagnóstico 
                              e seu score foi calculado com base nas respostas.
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Como funciona:</strong> Cada questão do diagnóstico tem um 
                              <strong> peso (1-10)</strong> que determina sua importância. 
                              Respostas positivas somam pontos, negativas diminuem.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              💡 Quanto maior o score, maior a necessidade do cliente pela sua solução.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm mb-2">
                              <strong>Score Manual:</strong> Leads criados manualmente começam com score 0.
                            </p>
                            <p className="text-sm mb-2">
                              Você pode editar o score conforme avalia:
                              <br />• Qualidade das interações
                              <br />• Fit com sua solução
                              <br />• Urgência da necessidade
                            </p>
                            <p className="text-sm text-muted-foreground">
                              💡 Use 0-30 (baixo), 31-60 (médio), 61-100 (alto).
                            </p>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="font-medium text-lg">{lead.score}/100</p>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      lead.score >= 70 ? 'bg-green-500' : 
                      lead.score >= 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prioridade</p>
                <p className="font-medium capitalize">{lead.prioridade || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Potencial</p>
                <p className="font-medium">
                  {lead.valor_potencial ? `R$ ${lead.valor_potencial.toLocaleString('pt-BR')}` : '-'}
                </p>
              </div>
            </div>
            
            <LeadActions 
              lead={lead} 
              onAgendar={() => setDialogAgendar(true)}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="interacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="interacoes">Interações</TabsTrigger>
            <TabsTrigger value="contatos">Contatos</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="interacoes">
            <div className="grid gap-6 md:grid-cols-2">
              <LeadInteracoes leadId={id!} />
              <LeadOportunidades leadId={id!} />
            </div>
          </TabsContent>

          <TabsContent value="contatos">
            <Card>
              <CardHeader>
                <CardTitle>Contatos do Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadContatosManager leadId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Agendados</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadEventos leadId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anotacoes">
            <LeadAnotacoesSection leadId={id!} />
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Timeline do Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadTimeline historico={lead.historico || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <LeadEditDialog
        lead={lead}
        open={dialogEdit}
        onOpenChange={setDialogEdit}
      />

      <AgendarEventoDialog
        lead={lead}
        open={dialogAgendar}
        onOpenChange={setDialogAgendar}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Lead"
        description={`Tem certeza que deseja excluir o lead "${lead.nome}"?`}
        warningItems={[
          "Todas as oportunidades vinculadas",
          "Todos os eventos agendados",
          "Contatos, anotações e histórico",
          "Interações registradas",
        ]}
        onConfirm={async () => {
          await deleteLead.mutateAsync(lead.id);
          navigate('/crm');
        }}
        isPending={deleteLead.isPending}
      />
    </MainLayout>
  );
}
