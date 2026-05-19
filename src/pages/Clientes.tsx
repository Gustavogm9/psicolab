import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Plus, Building, Users, MapPin, UserCircle, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { getStatusColor } from "@/lib/mock-data";
import { useState } from "react";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { useClientes } from "@/hooks/useClientes";
import { useClienteContatos } from "@/hooks/useClienteContatos";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

function ClienteCard({ cliente }: { cliente: any }) {
  const navigate = useNavigate();
  const { data: contatos } = useClienteContatos(cliente.id);
  const contatoPrincipal = contatos?.find(c => c.principal);
  const outrosContatos = (contatos?.length || 0) - (contatoPrincipal ? 1 : 0);

  const handleViewDetails = () => {
    navigate(`/clientes/${cliente.id}`);
  };

  return (
    <Card 
      className="card-premium cursor-pointer hover:scale-[1.02]" 
      onClick={handleViewDetails}
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
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                {!cliente.cpf_cnpj && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Sem CPF/CNPJ
                  </Badge>
                )}
              </div>
              {contatoPrincipal && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <UserCircle className="h-3 w-3" />
                  {contatoPrincipal.nome}
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
        {contatoPrincipal && (
          <div className="space-y-2 pb-3 border-b">
            {contatoPrincipal.email && (
              <p className="text-sm text-muted-foreground">
                📧 {contatoPrincipal.email}
              </p>
            )}
            {contatoPrincipal.telefone && (
              <p className="text-sm text-muted-foreground">
                📱 {contatoPrincipal.telefone}
              </p>
            )}
            {outrosContatos > 0 && (
              <p className="text-xs text-muted-foreground">
                +{outrosContatos} {outrosContatos === 1 ? 'outro contato' : 'outros contatos'}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{cliente.endereco}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{cliente.colaboradores} colaboradores</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Building className="h-4 w-4" />
          <span>{cliente.tipo}</span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Última avaliação: <span className="text-foreground">{cliente.ultima_avaliacao ? new Date(cliente.ultima_avaliacao).toLocaleDateString('pt-BR') : 'N/A'}</span>
            </p>
            <Badge variant="outline" className="text-xs">
              Risco: {cliente.risco_atual || 0}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Clientes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: clientes, isLoading } = useClientes();

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e contratos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientes?.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}

      <ClienteFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          toast.success('Cliente criado com sucesso!');
        }}
      />
      </div>
    </MainLayout>
  );
}
