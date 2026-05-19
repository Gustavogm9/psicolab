import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, Loader2, Check, X, Clock, RefreshCw, Trash2, Globe, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDominiosCustomizados, useDominioVerificacoes } from "@/hooks/useDominiosCustomizados";
import { useDominioMutations } from "@/hooks/useDominioMutations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gerarInstrucoesDNS, detectarTipoDominio, getMensagemConfiguracao } from "@/lib/dns-utils";
import { useActiveDomain } from "@/hooks/useActiveDomain";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DomainSettingsProps {
  perfilPublicoId: string;
  slug: string;
}

export const DomainSettings = ({ perfilPublicoId, slug }: DomainSettingsProps) => {
  const [novoDominio, setNovoDominio] = useState("");
  const { data: dominios = [], isLoading } = useDominiosCustomizados(perfilPublicoId);
  const { data: activeDomain } = useActiveDomain();
  const { adicionarDominio, verificarDNS, removerDominio, isAdding, isVerifying, isRemoving } = useDominioMutations();

  const dominioAtivo = dominios.find(d => d.status === 'ativo');
  
  // URL principal (domínio customizado se ativo, senão URL padrão)
  const primaryUrl = activeDomain?.isCustomDomain && dominioAtivo
    ? `https://${dominioAtivo.dominio}`
    : `${window.location.origin}/perfil/${slug}`;
  
  const alternativeUrl = activeDomain?.isCustomDomain && dominioAtivo
    ? `${window.location.origin}/perfil/${slug}`
    : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleAdicionarDominio = () => {
    if (!novoDominio.trim()) {
      toast.error("Digite um domínio válido");
      return;
    }
    adicionarDominio.mutate({ perfilPublicoId, dominio: novoDominio }, {
      onSuccess: () => setNovoDominio(""),
    });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pendente: { icon: Clock, color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", label: "Aguardando DNS" },
      dns_configurado: { icon: Clock, color: "bg-blue-500/10 text-blue-700 border-blue-500/20", label: "DNS Detectado" },
      aguardando_aprovacao: { icon: Clock, color: "bg-purple-500/10 text-purple-700 border-purple-500/20", label: "Aguardando Aprovação" },
      ativo: { icon: Check, color: "bg-green-500/10 text-green-700 border-green-500/20", label: "Ativo" },
      erro: { icon: X, color: "bg-red-500/10 text-red-700 border-red-500/20", label: "Erro" },
      rejeitado: { icon: X, color: "bg-gray-500/10 text-gray-700 border-gray-500/20", label: "Rejeitado" },
    };

    const config = configs[status as keyof typeof configs] || configs.pendente;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {dominioAtivo ? 'URLs do Perfil' : 'URL Atual do Perfil'}
          </CardTitle>
          <CardDescription>
            {dominioAtivo 
              ? 'Seu perfil está acessível via domínio customizado' 
              : 'Este é o endereço atual da sua página pública'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {dominioAtivo ? 'URL Principal (Domínio Customizado)' : 'URL do Perfil'}
            </label>
            <div className="flex gap-2">
              <Input value={primaryUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(primaryUrl, "URL")}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(primaryUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {alternativeUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                URL Alternativa (Lovable)
              </label>
              <div className="flex gap-2">
                <Input value={alternativeUrl} readOnly className="font-mono text-sm bg-muted/50" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(alternativeUrl, "URL alternativa")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta URL continua funcionando, mas recomendamos compartilhar a URL do domínio customizado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {dominioAtivo && (
        <Alert className="border-green-500/20 bg-green-500/5">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription>
            <strong>Domínio ativo:</strong> {dominioAtivo.dominio}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Domínio Customizado</CardTitle>
          <CardDescription>
            Configure seu próprio domínio para sua página pública
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {dominios.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você ainda não configurou um domínio customizado. Adicione um domínio para tornar sua página mais profissional.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="seunome.com.br"
                  value={novoDominio}
                  onChange={(e) => setNovoDominio(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdicionarDominio()}
                />
                <Button onClick={handleAdicionarDominio} disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dominios.map((dominio) => (
                <DominioCard
                  key={dominio.id}
                  dominio={dominio}
                  onVerificar={() => verificarDNS.mutate(dominio.id)}
                  onRemover={() => removerDominio.mutate(dominio.id)}
                  isVerifying={isVerifying}
                  isRemoving={isRemoving}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const DominioCard = ({
  dominio,
  onVerificar,
  onRemover,
  isVerifying,
  isRemoving,
}: any) => {
  const { data: verificacoes = [] } = useDominioVerificacoes(dominio.id);
  const [showHistory, setShowHistory] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  // Calcular tempo decorrido desde criação
  const horasDecorridas = differenceInHours(new Date(), new Date(dominio.created_at));
  const minutosDecorridos = differenceInMinutes(new Date(), new Date(dominio.created_at));
  
  const getTempoMensagem = () => {
    if (horasDecorridas < 1) {
      return `Criado há ${minutosDecorridos} minuto${minutosDecorridos !== 1 ? 's' : ''}`;
    } else if (horasDecorridas < 24) {
      return `Criado há ${horasDecorridas} hora${horasDecorridas !== 1 ? 's' : ''}`;
    } else {
      const dias = Math.floor(horasDecorridas / 24);
      return `Criado há ${dias} dia${dias !== 1 ? 's' : ''}`;
    }
  };

  const getMensagemPropagacao = () => {
    if (horasDecorridas < 1) {
      return "DNS geralmente propaga em minutos, mas pode levar até 48h.";
    } else if (horasDecorridas < 24) {
      return `Já se passaram ${horasDecorridas}h desde a criação. Continue verificando.`;
    } else if (horasDecorridas >= 48) {
      return "Mais de 48h se passaram. Se o DNS ainda não foi detectado, verifique as configurações com seu provedor.";
    } else {
      return "DNS ainda propagando. A maioria dos domínios é configurado em 24h.";
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pendente: { 
        icon: Clock, 
        color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", 
        label: "Aguardando DNS",
        tooltip: "Configuração DNS pendente. Siga as instruções abaixo e clique em 'Verificar DNS'."
      },
      dns_configurado: { 
        icon: Check, 
        color: "bg-blue-500/10 text-blue-700 border-blue-500/20", 
        label: "DNS Detectado",
        tooltip: "DNS configurado corretamente! Aguardando aprovação do administrador."
      },
      aguardando_aprovacao: { 
        icon: Clock, 
        color: "bg-purple-500/10 text-purple-700 border-purple-500/20", 
        label: "Aguardando Aprovação",
        tooltip: "DNS verificado com sucesso. Nosso time está configurando seu domínio."
      },
      ativo: { 
        icon: Check, 
        color: "bg-green-500/10 text-green-700 border-green-500/20", 
        label: "Ativo",
        tooltip: "Domínio totalmente ativo e funcional!"
      },
      erro: { 
        icon: X, 
        color: "bg-red-500/10 text-red-700 border-red-500/20", 
        label: "Erro",
        tooltip: "Erro na configuração. Verifique as instruções de DNS."
      },
      rejeitado: { 
        icon: X, 
        color: "bg-gray-500/10 text-gray-700 border-gray-500/20", 
        label: "Rejeitado",
        tooltip: "Domínio rejeitado pelo administrador. Veja detalhes abaixo."
      },
    };

    const config = configs[status as keyof typeof configs] || configs.pendente;
    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${config.color} border cursor-help`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getSSLBadge = (sslStatus?: string, sslErro?: string) => {
    if (!sslStatus || sslStatus === 'pendente') return null;

    const configs = {
      provisionando: { 
        icon: Clock, 
        color: "bg-blue-500/10 text-blue-700 border-blue-500/20", 
        label: "🔒 SSL Provisionando",
        tooltip: "Certificado SSL sendo provisionado. Pode levar até 24h."
      },
      ativo: { 
        icon: Check, 
        color: "bg-green-500/10 text-green-700 border-green-500/20", 
        label: "🔒 SSL Ativo",
        tooltip: "Certificado SSL ativo e válido. Seu site é seguro!"
      },
      erro: { 
        icon: X, 
        color: "bg-red-500/10 text-red-700 border-red-500/20", 
        label: "🔒 SSL Erro",
        tooltip: sslErro || "Erro ao provisionar certificado SSL."
      },
      expirado: { 
        icon: X, 
        color: "bg-orange-500/10 text-orange-700 border-orange-500/20", 
        label: "🔒 SSL Expirado",
        tooltip: "Certificado SSL expirado. Entre em contato com o suporte."
      },
    };

    const config = configs[sslStatus as keyof typeof configs];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${config.color} border cursor-help`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-mono">{dominio.dominio}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(dominio.status)}
              {getSSLBadge(dominio.ssl_status, dominio.ssl_erro_mensagem)}
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{getTempoMensagem()}</span>
              </div>
              {dominio.dns_verificado_em && (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    Última verificação: {formatDistanceToNow(new Date(dominio.dns_verificado_em), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              )}
              {!dominio.dns_verificado_em && dominio.status === 'pendente' && (
                <div className="flex items-center gap-1.5 text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>Ainda não verificado - configure o DNS e clique em verificar</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {dominio.status !== 'ativo' && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onVerificar}
                        disabled={isVerifying}
                        className="relative"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verificar DNS
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Forçar verificação manual do DNS agora</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemover}
                  disabled={isRemoving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {dominio.status !== 'ativo' && (
        <CardContent className="space-y-4">
          {(() => {
            const tipoDominio = detectarTipoDominio(dominio.dominio);
            const instrucoes = gerarInstrucoesDNS(dominio.dominio, dominio.token_verificacao);
            const mensagemConfig = getMensagemConfiguracao(dominio.dominio);

            return (
              <>
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Configure seu DNS no seu provedor de domínio:</strong>
                  </AlertDescription>
                </Alert>

                {tipoDominio.tipo === 'subdominio' && (
                  <Alert className="border-blue-500/20 bg-blue-500/5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-sm">
                      <strong>Atenção - Subdomínio detectado:</strong> Configure o registro A com o nome "{tipoDominio.subdominio}" 
                      no painel DNS do domínio raiz <strong>{tipoDominio.dominioRaiz}</strong>, não em "{dominio.dominio}".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {instrucoes.map((instrucao, index) => {
                    const isTxtRecord = instrucao.tipo === 'TXT';
                    return (
                    <div key={index} className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {instrucao.descricao}
                          {isTxtRecord && <span className="ml-2 text-xs text-muted-foreground">(Opcional)</span>}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(instrucao.valor, instrucao.tipo === 'A' ? 'IP' : 'Token')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      {isTxtRecord && (
                        <Alert className="mb-3 border-blue-500/20 bg-blue-500/5">
                          <Info className="w-4 h-4 text-blue-600" />
                          <AlertDescription className="text-xs">
                            <strong>Este registro é opcional.</strong> Ele acelera o processo de aprovação, 
                            mas não é obrigatório. Você pode pular esta etapa se preferir.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-mono">{instrucao.tipo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-mono">{instrucao.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-mono text-xs break-all">{instrucao.valor}</span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    {mensagemConfig}
                  </AlertDescription>
                </Alert>
              </>
            );
          })()}

          <Alert className={horasDecorridas >= 48 ? "border-orange-500/20 bg-orange-500/5" : ""}>
            <Clock className="w-4 h-4" />
            <AlertDescription className="text-xs space-y-1">
              <p><strong>Propagação DNS:</strong> {getMensagemPropagacao()}</p>
              <p className="text-muted-foreground">
                Nosso sistema verifica automaticamente a cada 30 minutos, mas você pode forçar uma verificação 
                clicando no botão "Verificar DNS" acima.
              </p>
            </AlertDescription>
          </Alert>

          {dominio.erro_mensagem && (
            <Alert variant="destructive">
              <X className="w-4 h-4" />
              <AlertDescription>{dominio.erro_mensagem}</AlertDescription>
            </Alert>
          )}

          {verificacoes.length > 0 && (
            <Collapsible open={showHistory} onOpenChange={setShowHistory}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full">
                  {showHistory ? "Ocultar" : "Ver"} histórico de verificações ({verificacoes.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {verificacoes.map((v: any) => (
                  <div key={v.id} className="text-xs p-2 rounded border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{v.tipo_verificacao}</span>
                      <span className={v.sucesso ? "text-green-600" : "text-red-600"}>
                        {v.sucesso ? "✓ Sucesso" : "✗ Falhou"}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(v.verificado_em), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      )}

      {dominio.status === 'ativo' && dominio.ativado_em && (
        <CardContent>
          <Alert className="border-green-500/20 bg-green-500/5">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription>
              Domínio ativo desde {formatDistanceToNow(new Date(dominio.ativado_em), { addSuffix: true, locale: ptBR })}. 
              Seu perfil está acessível em <strong>{dominio.dominio}</strong>!
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};
