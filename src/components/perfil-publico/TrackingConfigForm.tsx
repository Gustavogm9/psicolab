import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Check, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrackingConfigFormProps {
  gtmId: string | null;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  metaCapiToken: string | null;
  facebookDomainVerification: string | null;
  onSave: (data: {
    gtm_id: string | null;
    facebook_pixel_id: string | null;
    google_analytics_id: string | null;
    meta_capi_access_token: string | null;
    facebook_domain_verification: string | null;
  }) => void;
  isSaving?: boolean;
}

const validateGTMId = (id: string) => {
  if (!id) return true;
  return /^GTM-[A-Z0-9]+$/.test(id);
};

const validatePixelId = (id: string) => {
  if (!id) return true;
  return /^\d{15,16}$/.test(id);
};

const validateGA4Id = (id: string) => {
  if (!id) return true;
  return /^G-[A-Z0-9]+$/.test(id);
};

const validateCapiToken = (token: string) => {
  if (!token) return true;
  // Token da CAPI começa com EAA e tem 100+ caracteres
  return token.startsWith('EAA') && token.length >= 100;
};

const validateDomainVerification = (code: string) => {
  if (!code) return true;
  // Código alfanumérico de 20-40 caracteres
  return /^[a-z0-9]{20,40}$/i.test(code);
};

export function TrackingConfigForm({
  gtmId,
  facebookPixelId,
  googleAnalyticsId,
  metaCapiToken,
  facebookDomainVerification,
  onSave,
  isSaving = false,
}: TrackingConfigFormProps) {
  const [localGtmId, setLocalGtmId] = useState(gtmId || "");
  const [localPixelId, setLocalPixelId] = useState(facebookPixelId || "");
  const [localGa4Id, setLocalGa4Id] = useState(googleAnalyticsId || "");
  const [localCapiToken, setLocalCapiToken] = useState(metaCapiToken || "");
  const [localDomainVerification, setLocalDomainVerification] = useState(facebookDomainVerification || "");
  const [showCapiToken, setShowCapiToken] = useState(false);

  const gtmValid = validateGTMId(localGtmId);
  const pixelValid = validatePixelId(localPixelId);
  const ga4Valid = validateGA4Id(localGa4Id);
  const capiValid = validateCapiToken(localCapiToken);
  const domainVerificationValid = validateDomainVerification(localDomainVerification);

  const handleSave = () => {
    if (!gtmValid || !pixelValid || !ga4Valid || !capiValid || !domainVerificationValid) return;

    onSave({
      gtm_id: localGtmId || null,
      facebook_pixel_id: localPixelId || null,
      google_analytics_id: localGa4Id || null,
      meta_capi_access_token: localCapiToken || null,
      facebook_domain_verification: localDomainVerification || null,
    });
  };

  const hasChanges =
    localGtmId !== (gtmId || "") ||
    localPixelId !== (facebookPixelId || "") ||
    localGa4Id !== (googleAnalyticsId || "") ||
    localCapiToken !== (metaCapiToken || "") ||
    localDomainVerification !== (facebookDomainVerification || "");

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Configure os IDs de rastreamento para medir conversões, otimizar anúncios e entender o comportamento dos visitantes.
          Os scripts serão injetados automaticamente apenas na sua página pública.
        </AlertDescription>
      </Alert>

      {/* Google Tag Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Google Tag Manager</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      GTM permite gerenciar todas as suas tags de marketing em um só lugar.
                      Recomendado para quem usa múltiplas ferramentas de analytics.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              href="https://tagmanager.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Criar conta GTM
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>
            Container ID no formato GTM-XXXXXXX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gtm-id">GTM Container ID</Label>
            <div className="relative">
              <Input
                id="gtm-id"
                placeholder="GTM-XXXXXXX"
                value={localGtmId}
                onChange={(e) => setLocalGtmId(e.target.value.trim().toUpperCase())}
                className={localGtmId && !gtmValid ? "border-destructive" : ""}
              />
              {localGtmId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {gtmValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {localGtmId && !gtmValid && (
              <p className="text-sm text-destructive">
                Formato inválido. Use: GTM-XXXXXXX
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Facebook/Meta Pixel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Meta Pixel (Facebook)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Rastreie conversões dos seus anúncios no Facebook e Instagram,
                      crie audiências personalizadas e otimize campanhas.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              href="https://business.facebook.com/events_manager2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Criar Pixel
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>
            ID do Pixel (15-16 dígitos numéricos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pixel-id">Pixel ID</Label>
            <div className="relative">
              <Input
                id="pixel-id"
                placeholder="123456789012345"
                value={localPixelId}
                onChange={(e) => setLocalPixelId(e.target.value.trim())}
                className={localPixelId && !pixelValid ? "border-destructive" : ""}
              />
              {localPixelId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {pixelValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {localPixelId && !pixelValid && (
              <p className="text-sm text-destructive">
                Formato inválido. Use apenas números (15-16 dígitos)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Analytics 4 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Google Analytics 4</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Opcional se você usar GTM. Configure o GA4 através do GTM
                      para melhor controle e flexibilidade.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Criar propriedade GA4
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>
            Measurement ID no formato G-XXXXXXXXXX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localGtmId && (
            <Alert>
              <AlertDescription className="text-sm">
                💡 Você configurou o GTM. Recomendamos adicionar o GA4 através do GTM para melhor controle.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="ga4-id">GA4 Measurement ID</Label>
            <div className="relative">
              <Input
                id="ga4-id"
                placeholder="G-XXXXXXXXXX"
                value={localGa4Id}
                onChange={(e) => setLocalGa4Id(e.target.value.trim().toUpperCase())}
                className={localGa4Id && !ga4Valid ? "border-destructive" : ""}
              />
              {localGa4Id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {ga4Valid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {localGa4Id && !ga4Valid && (
              <p className="text-sm text-destructive">
                Formato inválido. Use: G-XXXXXXXXXX
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meta Conversions API (CAPI) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Meta Conversions API (CAPI)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      A API de Conversões envia eventos diretamente para a Meta,
                      melhorando a precisão de rastreamento mesmo com bloqueadores de anúncios.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              href="https://business.facebook.com/events_manager2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Obter Token
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>
            Token de acesso para eventos server-side (começa com EAA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!localPixelId && (
            <Alert>
              <AlertDescription className="text-sm">
                ⚠️ Configure o Pixel ID primeiro. A CAPI funciona em conjunto com o Pixel.
              </AlertDescription>
            </Alert>
          )}
          {localPixelId && (
            <Alert>
              <AlertDescription className="text-sm">
                🔒 O token é armazenado de forma segura e usado apenas no servidor para enviar eventos.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="capi-token">Access Token</Label>
            <div className="relative">
              <Input
                id="capi-token"
                type={showCapiToken ? "text" : "password"}
                placeholder="EAA..."
                value={localCapiToken}
                onChange={(e) => setLocalCapiToken(e.target.value.trim())}
                className={localCapiToken && !capiValid ? "border-destructive pr-20" : "pr-20"}
                disabled={!localPixelId}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCapiToken(!showCapiToken)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showCapiToken ? "Ocultar" : "Mostrar"}
                </button>
                {localCapiToken && (
                  capiValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )
                )}
              </div>
            </div>
            {localCapiToken && !capiValid && (
              <p className="text-sm text-destructive">
                Token inválido. Deve começar com "EAA" e ter pelo menos 100 caracteres.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Facebook Domain Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Verificação de Domínio (Meta)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Verifique a propriedade do seu domínio com a Meta para desbloquear
                      recursos como tracking de conversões e eventos de domínio.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              href="https://business.facebook.com/settings/owned-domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Gerenciar Domínios
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>
            Código de verificação do domínio (apenas o valor do content)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              📋 No Meta Business Suite → Configurações → Brand Safety → Domínios,
              copie apenas o código (ex: <code className="bg-muted px-1 rounded">2w65amanqvzm4vr3joy8bx2b8om4g9</code>)
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="domain-verification">Código de Verificação</Label>
            <div className="relative">
              <Input
                id="domain-verification"
                placeholder="2w65amanqvzm4vr3joy8bx2b8om4g9"
                value={localDomainVerification}
                onChange={(e) => setLocalDomainVerification(e.target.value.trim().toLowerCase())}
                className={localDomainVerification && !domainVerificationValid ? "border-destructive" : ""}
              />
              {localDomainVerification && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {domainVerificationValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {localDomainVerification && !domainVerificationValid && (
              <p className="text-sm text-destructive">
                Código inválido. Deve ter entre 20-40 caracteres alfanuméricos.
              </p>
            )}
            {localDomainVerification && domainVerificationValid && (
              <p className="text-sm text-muted-foreground">
                A meta tag será adicionada automaticamente na sua página pública.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || !gtmValid || !pixelValid || !ga4Valid || !capiValid || !domainVerificationValid || isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
