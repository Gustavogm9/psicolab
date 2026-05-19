import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy, ExternalLink, Key, Loader2, RefreshCw, Settings, Shield, Webhook, X, AlertCircle, Clock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAsaasCredentials } from "@/hooks/useAsaasCredentials";
import { useFaturaSync } from "@/hooks/useFaturaSync";
import { useWebhookTest } from "@/hooks/useWebhookTest";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { useWebhookStatus } from "@/hooks/useWebhookStatus";
import type { AsaasEnvironment } from "@/lib/asaas-types";
import { validateAsaasApiKey } from "@/lib/asaas-validator";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function AsaasConfig() {
  const navigate = useNavigate();
  const { credentials, isLoading, save, isSaving } = useAsaasCredentials();
  const { syncAll, isSyncing, syncResult } = useFaturaSync();
  const { testWebhook, isTesting } = useWebhookTest();
  const { data: webhookLogs, isLoading: isLoadingLogs } = useWebhookLogs(10);
  const { data: webhookStatus, isLoading: isLoadingStatus } = useWebhookStatus();
  
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<AsaasEnvironment>("sandbox");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [webhookToken, setWebhookToken] = useState("");
  const [showWebhookToken, setShowWebhookToken] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asaas-webhook`;

  // Auto-carregar credenciais e tokens ao trocar ambiente
  useEffect(() => {
    if (credentials) {
      const key = environment === 'sandbox' 
        ? credentials.sandbox_api_key 
        : credentials.production_api_key;
      const token = environment === 'sandbox'
        ? credentials.sandbox_webhook_token
        : credentials.production_webhook_token;
      setApiKey(key || '');
      setWebhookToken(token || '');
      setHasUnsavedChanges(false);
    }
  }, [environment, credentials]);

  // Buscar última sincronização ao carregar
  useEffect(() => {
    const lastSync = localStorage.getItem('asaas_last_sync');
    if (lastSync) {
      setUltimaSync(lastSync);
    }
  }, []);

  // Atualizar após sincronização
  useEffect(() => {
    if (syncResult && !isSyncing) {
      const now = new Date().toISOString();
      localStorage.setItem('asaas_last_sync', now);
      setUltimaSync(now);
    }
  }, [syncResult, isSyncing]);

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast.error("Digite sua API Key primeiro");
      return;
    }

    setIsTestingConnection(true);
    try {
      const result = await validateAsaasApiKey(apiKey, environment);
      
      if (result.valid) {
        toast.success(`Conexão bem-sucedida! Conta: ${result.accountInfo?.name}`);
      } else {
        toast.error(result.error || "API Key inválida");
      }
    } catch (error) {
      toast.error("Erro ao testar conexão");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      toast.error("Digite sua API Key");
      return;
    }

    save({ 
      api_key: apiKey, 
      environment,
      webhook_token: webhookToken || undefined
    });
    
    // Aguarda um momento e atualiza o estado
    setTimeout(() => {
      setHasUnsavedChanges(false);
      if (webhookToken) {
        toast.success("✅ Token do webhook salvo com sucesso!", {
          description: "O token está sincronizado com o banco de dados"
        });
      }
    }, 1000);
  };

  const generateWebhookToken = () => {
    const token = crypto.randomUUID();
    setWebhookToken(token);
    setHasUnsavedChanges(true);
    toast.warning("⚠️ Token gerado - CLIQUE EM 'SALVAR CREDENCIAIS' para aplicar!", {
      description: "O token só será salvo após você clicar no botão Salvar",
      duration: 5000
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const isConfigured = !!(credentials?.sandbox_api_key || credentials?.production_api_key);
  const currentEnvConfigured = environment === 'sandbox' 
    ? !!credentials?.sandbox_api_key 
    : !!credentials?.production_api_key;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/financeiro")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configuração Asaas</h1>
            <p className="text-muted-foreground">
              Integre seu sistema de pagamentos para automatizar cobranças
            </p>
          </div>
        </div>

        {/* Status da Integração */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Status da Integração</CardTitle>
            </div>
            <CardDescription>
              Informações sobre sua integração com o Asaas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Sandbox</p>
                    <p className="text-sm text-muted-foreground">Ambiente de testes</p>
                  </div>
                  <Badge variant={credentials?.sandbox_api_key ? "default" : "secondary"}>
                    {credentials?.sandbox_api_key ? "✅ Configurado" : "⚠️ Não configurado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Produção</p>
                    <p className="text-sm text-muted-foreground">Cobranças reais</p>
                  </div>
                  <Badge variant={credentials?.production_api_key ? "default" : "secondary"}>
                    {credentials?.production_api_key ? "✅ Configurado" : "⚠️ Não configurado"}
                  </Badge>
                </div>
              </div>
              
              {credentials?.account_name && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Conta Asaas</p>
                  <p className="text-sm text-muted-foreground">{credentials.account_name}</p>
                </div>
              )}
              
              {credentials?.last_validation_at && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Última Validação</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credentials.last_validation_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credenciais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <span>Credenciais da API</span>
              </div>
              {credentials?.connection_status === 'validated' && currentEnvConfigured && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Conexão Validada
                </Badge>
              )}
              {credentials?.connection_status === 'failed' && currentEnvConfigured && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Falha na Conexão
                </Badge>
              )}
              {(!credentials?.connection_status || credentials?.connection_status === 'not_tested') && currentEnvConfigured && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Não Testada
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure sua API Key do Asaas para habilitar a integração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <RadioGroup
                value={environment}
                onValueChange={(value) => setEnvironment(value as AsaasEnvironment)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sandbox" id="sandbox" />
                  <Label htmlFor="sandbox" className="cursor-pointer flex items-center gap-2">
                    🧪 Sandbox (Testes)
                    {credentials?.sandbox_api_key && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="production" id="production" />
                  <Label htmlFor="production" className="cursor-pointer flex items-center gap-2">
                    🚀 Produção
                    {credentials?.production_api_key && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                {environment === 'sandbox' 
                  ? '💡 Use Sandbox para testes sem cobranças reais' 
                  : '⚠️ Produção realizará cobranças reais de clientes'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api_key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentEnvConfigured ? "••••••••••••••••" : "Cole sua API Key aqui"}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtenha sua API Key no{" "}
                <a
                  href={`https://${environment === "sandbox" ? "sandbox." : ""}asaas.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  painel Asaas
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            {hasUnsavedChanges && (
              <Alert className="border-amber-500 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">⚠️ Alterações Não Salvas</AlertTitle>
                <AlertDescription className="text-amber-800">
                  Você tem um novo token gerado que ainda não foi salvo no banco de dados.
                  Clique em "Salvar Credenciais" abaixo para sincronizar.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleTestConnection}
                variant="outline"
                disabled={!apiKey || isTestingConnection}
              >
                {isTestingConnection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Testar Conexão
              </Button>
              <Button
                onClick={handleSave}
                disabled={!apiKey || isSaving}
                className={hasUnsavedChanges ? "animate-pulse" : ""}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {hasUnsavedChanges ? "💾 Salvar Alterações" : "Salvar Credenciais"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              <CardTitle>Configuração de Webhooks</CardTitle>
            </div>
            <CardDescription>
              Configure os webhooks no painel Asaas para receber notificações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <div className="flex gap-2">
                <Input 
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "URL copiada!")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use a mesma URL para Sandbox e Produção. Configure em ambos os painéis.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-token-input">Token de Validação (Opcional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Token para validar requisições do Asaas. Cada ambiente pode ter um token diferente.
                </p>
                <div className="flex gap-2">
                  <Input 
                    id="webhook-token-input"
                    type={showWebhookToken ? "text" : "password"}
                    value={webhookToken}
                    onChange={(e) => setWebhookToken(e.target.value)}
                    placeholder="Token opcional de validação"
                    className="font-mono text-sm"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowWebhookToken(!showWebhookToken)}
                  >
                    {showWebhookToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={generateWebhookToken}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar
                  </Button>
                  {webhookToken && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(webhookToken, "Token copiado!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Indicador de Status do Token */}
                {webhookToken && (
                  <div className="mt-2 p-3 bg-muted rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasUnsavedChanges ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">Token não sincronizado</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Token sincronizado com banco</span>
                          </>
                        )}
                      </div>
                      <code className="text-xs text-muted-foreground">...{webhookToken.slice(-6)}</code>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">⚠️ IMPORTANTE: Configure em AMBOS os painéis Asaas</AlertTitle>
                <AlertDescription className="text-orange-800">
                  <div className="mt-2 space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="font-semibold mb-2">🧪 Sandbox (Testes):</p>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Acesse: <a href="https://sandbox.asaas.com" target="_blank" rel="noopener noreferrer" className="underline">sandbox.asaas.com</a></li>
                        <li>Vá em Integrações → Webhooks → Adicionar Webhook</li>
                        <li>Cole a URL acima</li>
                        <li>Cole o token {environment === 'sandbox' ? 'atual' : '(configure no ambiente Sandbox)'}</li>
                        <li>Selecione os eventos e salve</li>
                      </ol>
                    </div>

                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="font-semibold mb-2">🚀 Produção (Real):</p>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Acesse: <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer" className="underline">asaas.com</a></li>
                        <li>Vá em Integrações → Webhooks → Adicionar Webhook</li>
                        <li>Cole a URL acima</li>
                        <li>Cole o token {environment === 'production' ? 'atual' : '(configure no ambiente Produção)'}</li>
                        <li>Selecione os eventos e salve</li>
                      </ol>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Teste de Webhook */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Testar Webhook</h4>
                  <p className="text-xs text-muted-foreground">
                    Envie uma requisição de teste para verificar se o webhook está respondendo
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testWebhook}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Webhook className="h-4 w-4 mr-2" />
                      Testar Agora
                    </>
                  )}
                </Button>
              </div>

              {/* Status do Webhook */}
              {!isLoadingStatus && webhookStatus && (
                <div className={`p-3 rounded-lg border ${
                  webhookStatus.status === 'active' 
                    ? 'bg-green-500/10 border-green-200' 
                    : webhookStatus.status === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-200'
                    : 'bg-gray-500/10 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      webhookStatus.status === 'active' 
                        ? 'bg-green-500 animate-pulse' 
                        : webhookStatus.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">
                      {webhookStatus.status === 'active' && '🟢 Webhook Ativo'}
                      {webhookStatus.status === 'warning' && '🟡 Webhook com Aviso'}
                      {webhookStatus.status === 'inactive' && '🔴 Webhook Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {webhookStatus.message}
                  </p>
                  {webhookStatus.lastEvent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Último evento: {format(new Date(webhookStatus.lastEvent), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Últimos Webhooks Recebidos */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Últimos Webhooks Recebidos</h4>
              <p className="text-xs text-muted-foreground">
                Eventos recentes processados pelo sistema (atualiza automaticamente)
              </p>
              
              {isLoadingLogs ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : webhookLogs && webhookLogs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {webhookLogs.map((item, index) => (
                    <div 
                      key={`${item.fatura_id}-${index}`}
                      className="p-3 bg-muted/50 rounded-lg text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {item.log.event.replace('PAYMENT_', '').replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.numero_fatura}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(item.log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss")}
                      </div>
                      {item.log.status_anterior && item.log.status_novo && (
                        <div className="text-xs">
                          Status: <span className="text-red-600">{item.log.status_anterior}</span>
                          {' → '}
                          <span className="text-green-600">{item.log.status_novo}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <Webhook className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum webhook recebido ainda
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure os webhooks no painel Asaas e aguarde eventos
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Eventos de Pagamento Suportados</h4>
              <p className="text-xs text-muted-foreground">
                Todos os eventos abaixo são processados automaticamente pelo sistema
              </p>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {[
                  { code: 'PAYMENT_CREATED', desc: 'Cobrança criada', priority: 'baixa' },
                  { code: 'PAYMENT_RECEIVED', desc: 'Pagamento recebido', priority: 'alta' },
                  { code: 'PAYMENT_CONFIRMED', desc: 'Pagamento confirmado', priority: 'alta' },
                  { code: 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED', desc: 'Cartão recusado', priority: 'critica' },
                  { code: 'PAYMENT_OVERDUE', desc: 'Pagamento atrasado', priority: 'media' },
                  { code: 'PAYMENT_DELETED', desc: 'Cobrança cancelada', priority: 'media' },
                  { code: 'PAYMENT_REFUNDED', desc: 'Estorno total', priority: 'alta' },
                  { code: 'PAYMENT_PARTIALLY_REFUNDED', desc: 'Estorno parcial', priority: 'media' },
                  { code: 'PAYMENT_RESTORED', desc: 'Cobrança restaurada', priority: 'baixa' },
                  { code: 'PAYMENT_ANTICIPATED', desc: 'Pagamento antecipado', priority: 'baixa' },
                  { code: 'PAYMENT_AWAITING_RISK_ANALYSIS', desc: 'Aguardando análise de risco', priority: 'media' },
                  { code: 'PAYMENT_APPROVED_BY_RISK_ANALYSIS', desc: 'Aprovado na análise', priority: 'baixa' },
                  { code: 'PAYMENT_REPROVED_BY_RISK_ANALYSIS', desc: 'Reprovado na análise', priority: 'critica' },
                  { code: 'PAYMENT_CHARGEBACK_REQUESTED', desc: 'Chargeback solicitado', priority: 'critica' },
                  { code: 'PAYMENT_CHARGEBACK_DISPUTE', desc: 'Chargeback em disputa', priority: 'alta' },
                  { code: 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL', desc: 'Aguardando reversão', priority: 'media' },
                  { code: 'PAYMENT_BANK_SLIP_VIEWED', desc: 'Boleto visualizado', priority: 'baixa' },
                  { code: 'PAYMENT_CHECKOUT_VIEWED', desc: 'Fatura visualizada', priority: 'baixa' },
                  { code: 'PAYMENT_DUNNING_RECEIVED', desc: 'Notificação de cobrança recebida', priority: 'baixa' },
                  { code: 'PAYMENT_DUNNING_REQUESTED', desc: 'Notificação de cobrança solicitada', priority: 'baixa' },
                  { code: 'PAYMENT_UPDATED', desc: 'Cobrança atualizada', priority: 'baixa' },
                ].map(evento => {
                  const priorityColors = {
                    critica: 'text-red-600 bg-red-50 border-red-200',
                    alta: 'text-orange-600 bg-orange-50 border-orange-200',
                    media: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                    baixa: 'text-green-600 bg-green-50 border-green-200'
                  };
                  const priorityIcons = {
                    critica: '🔴',
                    alta: '🟠',
                    media: '🟡',
                    baixa: '🟢'
                  };
                  
                  return (
                    <div key={evento.code} className="flex items-center gap-2 text-sm p-2 rounded border bg-card">
                      <span className="text-base">{priorityIcons[evento.priority as keyof typeof priorityIcons]}</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-shrink-0">{evento.code}</code>
                      <span className="text-muted-foreground flex-1">{evento.desc}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${priorityColors[evento.priority as keyof typeof priorityColors]}`}>
                        {evento.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                💡 <strong>Eventos críticos</strong> (🔴) e de <strong>alta prioridade</strong> (🟠) geram alertas automáticos no sistema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sincronização */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <CardTitle>Sincronização</CardTitle>
            </div>
            <CardDescription>
              Mantenha suas faturas sempre atualizadas com o Asaas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Sincronização</span>
                <Badge variant="outline">
                  {ultimaSync ? format(new Date(ultimaSync), "dd/MM/yyyy 'às' HH:mm") : 'Nunca'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                A sincronização automática ocorre diariamente às 6h da manhã
              </p>
            </div>

            {syncResult && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{syncResult.total_faturas}</p>
                  <p className="text-xs text-muted-foreground">Processadas</p>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{syncResult.atualizadas}</p>
                  <p className="text-xs text-muted-foreground">Atualizadas</p>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{syncResult.erros}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => syncAll()}
                disabled={!isConfigured || isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar Agora
                  </>
                )}
              </Button>
            </div>

            {isSyncing && (
              <div className="space-y-2">
                <Progress value={undefined} className="animate-pulse" />
                <p className="text-xs text-center text-muted-foreground">
                  Sincronizando faturas pendentes...
                </p>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-semibold">ℹ️ Como Funciona:</p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Sincronização automática diária às 6h da manhã</li>
                <li>Atualiza status de todas as faturas pendentes</li>
                <li>Webhooks fornecem atualizações em tempo real</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
