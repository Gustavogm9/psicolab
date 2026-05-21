import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Target, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useClienteDetalhes } from "@/hooks/useClienteDetalhes";
import { useProjetosCliente } from "@/hooks/useProjetosCliente";
import { useEventosCliente } from "@/hooks/useEventosCliente";
import { useAlertasCliente } from "@/hooks/useAlertasCliente";
import { useIntervencoesCliente } from "@/hooks/useIntervencoesCliente";
import { useClienteMutation } from "@/hooks/useClienteMutation";
import { ClienteOverview } from "@/components/clientes/ClienteOverview";
import { ClienteProjetos } from "@/components/clientes/ClienteProjetos";
import { ClienteEventos } from "@/components/clientes/ClienteEventos";
import { ClienteAlertas } from "@/components/clientes/ClienteAlertas";
import { ClienteAnalytics } from "@/components/clientes/ClienteAnalytics";
import { ClienteInteracoes } from "@/components/clientes/ClienteInteracoes";
import { ClienteOportunidades } from "@/components/clientes/ClienteOportunidades";
import { ClienteIntervencoes } from "@/components/clientes/ClienteIntervencoes";
import { useState } from "react";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteCliente, isDeleting } = useClienteMutation();

  const { data: cliente, isLoading: isLoadingCliente } = useClienteDetalhes(id);
  const { data: projetos = [], isLoading: isLoadingProjetos } = useProjetosCliente(id);
  const { data: eventos = [], isLoading: isLoadingEventos } = useEventosCliente(id);
  const { data: alertas = [], isLoading: isLoadingAlertas } = useAlertasCliente(id);
  const { data: intervencoes = [], isLoading: isLoadingIntervencoes } = useIntervencoesCliente(id);
  
  // Buscar lead de origem se este cliente veio de um lead
  const { data: leadOrigem } = useQuery({
    queryKey: ['lead-origem', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads_diagnostico')
        .select('*')
        .eq('cliente_id', id)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  if (isLoadingCliente) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando informações do cliente...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!cliente) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-muted-foreground">Cliente não encontrado.</p>
          <Button onClick={() => navigate('/clientes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Alert para Cliente Originado de Lead */}
        {leadOrigem && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <Target className="h-4 w-4" />
            <AlertTitle>Cliente Originado de Lead</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              Convertido do lead "{leadOrigem.nome}" em {format(new Date(leadOrigem.created_at), "dd/MM/yyyy")}
              <Button 
                variant="link" 
                className="p-0 h-auto text-green-600 hover:text-green-700"
                onClick={() => navigate(`/crm/${leadOrigem.id}`)}
              >
                Ver Histórico do Lead →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header com Navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/clientes')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{cliente.nome}</h1>
              <p className="text-muted-foreground">Detalhes e histórico do cliente</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
            {leadOrigem && (
              <Button variant="outline" onClick={() => navigate(`/crm/${leadOrigem.id}`)}>
                <Target className="mr-2 h-4 w-4" />
                Ver Histórico como Lead
              </Button>
            )}
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="interacoes">Interações</TabsTrigger>
            <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
            <TabsTrigger value="intervencoes">
              Intervenções ({intervencoes.length})
            </TabsTrigger>
            <TabsTrigger value="projetos">
              Projetos ({projetos.length})
            </TabsTrigger>
            <TabsTrigger value="eventos">
              Eventos ({eventos.length})
            </TabsTrigger>
            <TabsTrigger value="alertas">
              Alertas ({alertas.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ClienteOverview 
              cliente={cliente}
              totalProjetos={projetos.length}
              totalEventos={eventos.length}
              totalAlertas={alertas.length}
              totalIntervencoes={intervencoes.length}
            />
          </TabsContent>

          <TabsContent value="interacoes">
            <ClienteInteracoes clienteId={id!} />
          </TabsContent>

          <TabsContent value="oportunidades">
            <ClienteOportunidades clienteId={id!} />
          </TabsContent>

          <TabsContent value="intervencoes">
            <ClienteIntervencoes 
              intervencoes={intervencoes}
              isLoading={isLoadingIntervencoes}
            />
          </TabsContent>

          <TabsContent value="projetos">
            <ClienteProjetos 
              projetos={projetos}
              isLoading={isLoadingProjetos}
            />
          </TabsContent>

          <TabsContent value="eventos">
            <ClienteEventos 
              eventos={eventos}
              isLoading={isLoadingEventos}
            />
          </TabsContent>

          <TabsContent value="alertas">
            <ClienteAlertas 
              alertas={alertas}
              isLoading={isLoadingAlertas}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <ClienteAnalytics 
              cliente={cliente}
              projetos={projetos}
            />
          </TabsContent>
        </Tabs>

        {/* Modal de Edição */}
        <ClienteFormModal 
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          clienteData={cliente}
          onSuccess={() => {
            toast.success('Cliente atualizado com sucesso!');
          }}
        />

        {/* Dialog de Exclusão */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir Cliente"
          description={`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`}
          warningItems={[
            `${projetos.length} projeto(s) vinculado(s)`,
            `${intervencoes.length} intervenção(ões) registrada(s)`,
            `${eventos.length} evento(s) agendado(s)`,
            "Contatos cadastrados",
            "Histórico de interações",
            "Oportunidades associadas",
          ].filter((_, index) => {
            // Só mostrar se houver dados
            if (index === 0) return projetos.length > 0;
            if (index === 1) return intervencoes.length > 0;
            if (index === 2) return eventos.length > 0;
            return true;
          })}
          onConfirm={async () => {
            await deleteCliente(cliente.id);
            navigate('/clientes');
          }}
          isPending={isDeleting}
        />
      </div>
    </MainLayout>
  );
}
