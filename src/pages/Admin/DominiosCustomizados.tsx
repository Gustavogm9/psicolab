import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Clock, ExternalLink, Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useAllDominios } from "@/hooks/useDominiosCustomizados";
import { useDominioMutations } from "@/hooks/useDominioMutations";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DominiosCustomizados() {
  const queryClient = useQueryClient();
  const { data: dominios = [], isLoading } = useAllDominios();
  const { aprovarDominio, rejeitarDominio, isApproving, isRejecting } = useDominioMutations();
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("all");
  const [dominioSelecionado, setDominioSelecionado] = useState<any>(null);
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showRejeitarDialog, setShowRejeitarDialog] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // Garantir que o filtro inicial seja "all"
  useEffect(() => {
    setStatusFiltro("all");
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['all-dominios-customizados'] });
  };

  const dominiosFiltrados = dominios.filter((d: any) => {
    const matchFiltro = d.dominio.toLowerCase().includes(filtro.toLowerCase()) ||
                       d.perfis_publicos?.user_id?.toLowerCase().includes(filtro.toLowerCase());
    const matchStatus = statusFiltro === "all" || d.status === statusFiltro;
    return matchFiltro && matchStatus;
  });

  const aguardandoAprovacao = dominios.filter((d: any) => d.status === 'aguardando_aprovacao').length;
  const ativos = dominios.filter((d: any) => d.status === 'ativo').length;
  const pendentes = dominios.filter((d: any) => d.status === 'pendente' || d.status === 'dns_configurado').length;

  const handleAprovar = () => {
    if (!dominioSelecionado) return;
    aprovarDominio.mutate(
      { dominioId: dominioSelecionado.id, notasAdmin },
      {
        onSuccess: () => {
          setShowAprovarDialog(false);
          setDominioSelecionado(null);
          setNotasAdmin("");
        },
      }
    );
  };

  const handleRejeitar = () => {
    if (!dominioSelecionado || !motivoRejeicao.trim()) return;
    rejeitarDominio.mutate(
      { dominioId: dominioSelecionado.id, motivo: motivoRejeicao },
      {
        onSuccess: () => {
          setShowRejeitarDialog(false);
          setDominioSelecionado(null);
          setMotivoRejeicao("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Domínios Customizados</h1>
        <p className="text-muted-foreground">
          Gerencie e aprove domínios customizados dos psicólogos
        </p>
      </div>

      {/* Alert de Debug */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Debug Info:</strong> Carregados {dominios.length} domínios | 
          Filtrados: {dominiosFiltrados.length} | 
          Status atual: <code className="bg-muted px-1 rounded">{statusFiltro}</code> | 
          Filtro busca: <code className="bg-muted px-1 rounded">"{filtro}"</code>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{aguardandoAprovacao}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Domínios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendentes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Domínios</CardTitle>
              <CardDescription>Todos os domínios customizados cadastrados</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar
              </Button>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar domínio..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFiltro} onValueChange={setStatusFiltro}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="aguardando_aprovacao">Aguardando</TabsTrigger>
              <TabsTrigger value="ativo">Ativos</TabsTrigger>
              <TabsTrigger value="pendente">Pendentes</TabsTrigger>
              <TabsTrigger value="erro">Erros</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6 space-y-4">
            {dominiosFiltrados.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nenhum domínio encontrado</strong>
                  <div className="mt-2 text-sm">
                    {dominios.length === 0 
                      ? "Nenhum domínio foi cadastrado ainda no sistema."
                      : `Existem ${dominios.length} domínio(s) no total, mas nenhum corresponde aos filtros atuais (Status: ${statusFiltro}, Busca: "${filtro}").`
                    }
                  </div>
                  {dominios.length > 0 && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setStatusFiltro("all");
                        setFiltro("");
                      }}>
                        Limpar Filtros
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              dominiosFiltrados.map((dominio: any) => (
                <DominioCard
                  key={dominio.id}
                  dominio={dominio}
                  onAprovar={() => {
                    setDominioSelecionado(dominio);
                    setShowAprovarDialog(true);
                  }}
                  onRejeitar={() => {
                    setDominioSelecionado(dominio);
                    setShowRejeitarDialog(true);
                  }}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Aprovação */}
      <Dialog open={showAprovarDialog} onOpenChange={setShowAprovarDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aprovar Domínio</DialogTitle>
            <DialogDescription>
              Configure o domínio no Lovable antes de aprovar
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instruções:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                <li>Acesse Lovable → Settings → Domains</li>
                <li>Clique em "Connect Domain"</li>
                <li>Adicione o domínio: <code className="font-mono bg-muted px-1 rounded">{dominioSelecionado?.dominio}</code></li>
                <li>Use o token de verificação: <code className="font-mono bg-muted px-1 rounded text-xs break-all">{dominioSelecionado?.token_verificacao}</code></li>
                <li>Aguarde a ativação no Lovable</li>
                <li>Clique em "Aprovar" abaixo quando o domínio estiver ativo</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Textarea
              placeholder="Adicione notas sobre a aprovação..."
              value={notasAdmin}
              onChange={(e) => setNotasAdmin(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAprovarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAprovar} disabled={isApproving}>
              {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Aprovar e Ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejeitarDialog} onOpenChange={setShowRejeitarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Domínio</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo da rejeição *</label>
            <Textarea
              placeholder="Ex: Domínio não verificado, problema com DNS, domínio inválido..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejeitarDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejeitar}
              disabled={isRejecting || !motivoRejeicao.trim()}
            >
              {isRejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DominioCard = ({ dominio, onAprovar, onRejeitar }: any) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: { icon: Clock, color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", label: "Aguardando DNS" },
      dns_configurado: { icon: Clock, color: "bg-blue-500/10 text-blue-700 border-blue-500/20", label: "DNS Detectado" },
      aguardando_aprovacao: { icon: Clock, color: "bg-purple-500/10 text-purple-700 border-purple-500/20", label: "Aguardando Aprovação" },
      ativo: { icon: Check, color: "bg-green-500/10 text-green-700 border-green-500/20", label: "Ativo" },
      erro: { icon: X, color: "bg-red-500/10 text-red-700 border-red-500/20", label: "Erro" },
      rejeitado: { icon: X, color: "bg-gray-500/10 text-gray-700 border-gray-500/20", label: "Rejeitado" },
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const getSSLConfig = (sslStatus?: string) => {
    if (!sslStatus || sslStatus === 'pendente') return null;
    
    const configs = {
      provisionando: { icon: Clock, color: "bg-blue-500/10 text-blue-700 border-blue-500/20", label: "🔒 Provisionando" },
      ativo: { icon: Check, color: "bg-green-500/10 text-green-700 border-green-500/20", label: "🔒 SSL Ativo" },
      erro: { icon: X, color: "bg-red-500/10 text-red-700 border-red-500/20", label: "🔒 SSL Erro" },
      expirado: { icon: X, color: "bg-orange-500/10 text-orange-700 border-orange-500/20", label: "🔒 Expirado" },
    };
    return configs[sslStatus as keyof typeof configs];
  };

  const config = getStatusConfig(dominio.status);
  const sslConfig = getSSLConfig(dominio.ssl_status);
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-mono text-lg font-medium">{dominio.dominio}</h3>
              <Badge variant="outline" className={`${config.color} border`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              {sslConfig && (
                <Badge variant="outline" className={`${sslConfig.color} border`} title={dominio.ssl_erro_mensagem || ''}>
                  <sslConfig.icon className="w-3 h-3 mr-1" />
                  {sslConfig.label}
                </Badge>
              )}
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Psicólogo ID:</span>
                <span className="font-mono text-xs">{dominio.perfis_publicos?.user_id?.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Perfil:</span>
                <a 
                  href={`/p/${dominio.perfis_publicos?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {dominio.perfis_publicos?.slug}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Criado:</span>
                <span>{formatDistanceToNow(new Date(dominio.created_at), { addSuffix: true, locale: ptBR })}</span>
              </div>
              {dominio.dns_verificado_em && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">DNS verificado:</span>
                  <span>{formatDistanceToNow(new Date(dominio.dns_verificado_em), { addSuffix: true, locale: ptBR })}</span>
                </div>
              )}
            </div>

            {dominio.erro_mensagem && (
              <Alert variant="destructive" className="mt-2">
                <X className="h-4 w-4" />
                <AlertDescription className="text-xs">{dominio.erro_mensagem}</AlertDescription>
              </Alert>
            )}

            {dominio.ssl_erro_mensagem && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>SSL:</strong> {dominio.ssl_erro_mensagem}
                  {dominio.ssl_status === 'provisionando' && (
                    <p className="mt-1 text-muted-foreground">
                      O certificado SSL é provisionado automaticamente pelo Lovable. Aguarde até 24h.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {dominio.notas_admin && (
              <Alert className="mt-2">
                <AlertDescription className="text-xs">
                  <strong>Notas:</strong> {dominio.notas_admin}
                  {dominio.notas_admin.includes('TXT verificado: ✓') && (
                    <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-700 border-green-500/20">
                      <Check className="w-3 h-3 mr-1" />
                      TXT Verificado
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {dominio.status === 'aguardando_aprovacao' && (
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={onAprovar}>
                <Check className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button size="sm" variant="outline" onClick={onRejeitar}>
                <X className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
