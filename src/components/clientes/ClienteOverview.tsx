import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Users, MapPin, Calendar, TrendingUp, Mail, Target, FileText } from "lucide-react";
import { getStatusColor } from "@/lib/mock-data";
import { ContatosManager } from "./ContatosManager";
import { formatCpfCnpj } from "@/lib/cpf-cnpj-validator";

interface ClienteOverviewProps {
  cliente: any;
  totalProjetos: number;
  totalEventos: number;
  totalAlertas: number;
  totalIntervencoes: number;
}

export function ClienteOverview({ cliente, totalProjetos, totalEventos, totalAlertas, totalIntervencoes }: ClienteOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header com Avatar e Informações Principais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {cliente.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{cliente.nome}</h2>
                <p className="text-muted-foreground">{cliente.responsavel}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(cliente.status)}>
                  {cliente.status}
                </Badge>
                <Badge variant="outline">
                  Risco: {cliente.risco_atual || 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjetos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intervenções</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntervencoes}</div>
            <p className="text-xs text-muted-foreground">
              Ações em andamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEventos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlertas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Colaboradores</p>
                  <p className="text-sm text-muted-foreground">{cliente.colaboradores} pessoas</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tipo de Empresa</p>
                  <p className="text-sm text-muted-foreground capitalize">{cliente.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">CPF/CNPJ</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.cpf_cnpj ? formatCpfCnpj(cliente.cpf_cnpj) : 'Não informado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Última Avaliação</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.ultima_avaliacao ? new Date(cliente.ultima_avaliacao).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContatosManager clienteId={cliente.id} />
        </CardContent>
      </Card>
    </div>
  );
}
