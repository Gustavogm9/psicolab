import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Copy, 
  ExternalLink, 
  QrCode, 
  Share2, 
  UserPlus, 
  Link2, 
  Users, 
  AlertCircle,
  Info,
  ChevronRight,
  Lock
} from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useState } from 'react';
import { useActiveDomain } from '@/hooks/useActiveDomain';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface CompartilharAvaliacaoProps {
  avaliacao: {
    id: string;
    nome: string;
    slug?: string;
    tipo_acesso?: 'publico' | 'restrito';
    permite_auto_identificacao?: boolean;
  };
  participantes?: Array<{
    id: string;
    nome?: string;
    email: string;
    token_acesso?: string;
    respondido?: boolean;
  }>;
  onNavigateToParticipantes?: () => void;
  onNavigateToInformacoes?: () => void;
  onAtivarLinkGeral?: () => Promise<void>;
  isActivating?: boolean;
}

export const CompartilharAvaliacao = ({ 
  avaliacao, 
  participantes = [],
  onNavigateToParticipantes,
  onNavigateToInformacoes,
  onAtivarLinkGeral,
  isActivating = false
}: CompartilharAvaliacaoProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { data: activeDomain } = useActiveDomain();
  
  const baseUrl = activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}` 
    : window.location.origin;
  
  const linkGeral = avaliacao.slug ? `${baseUrl}/avaliacao/${avaliacao.slug}` : '';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: `${label} copiado para a área de transferência`,
      });
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link',
        variant: 'destructive',
      });
    }
  };

  const shareLink = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: avaliacao.nome,
          text: `Responda a avaliação: ${avaliacao.nome}`,
          url: url,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      copyToClipboard(url, 'Link');
    }
  };

  // Modo Público
  if (avaliacao.tipo_acesso === 'publico' && avaliacao.slug) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartilhar Avaliação Pública
            </CardTitle>
            <CardDescription>
              Esta avaliação é pública. Qualquer pessoa com o link pode responder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link da Avaliação</Label>
              <div className="flex gap-2">
                <Input value={linkGeral} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(linkGeral, 'Link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(linkGeral, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shareLink(linkGeral)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowQRCode(!showQRCode)}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQRCode ? 'Ocultar QR Code' : 'Mostrar QR Code'}
            </Button>

            {showQRCode && (
              <QRCodeDisplay
                url={linkGeral}
                titulo={avaliacao.nome}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modo Restrito com Auto-identificação
  if (avaliacao.tipo_acesso === 'restrito' && avaliacao.permite_auto_identificacao && avaliacao.slug) {
    const responderam = participantes.filter(p => p.respondido).length;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Link Geral da Avaliação
              <Badge variant="secondary" className="ml-2">Auto-identificação</Badge>
            </CardTitle>
            <CardDescription>
              Os participantes se identificam (nome/e-mail) antes de responder. 
              Cada pessoa só pode responder uma vez.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link para Distribuir</Label>
              <div className="flex gap-2">
                <Input value={linkGeral} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(linkGeral, 'Link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(linkGeral, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shareLink(linkGeral)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowQRCode(!showQRCode)}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQRCode ? 'Ocultar QR Code' : 'Mostrar QR Code'}
            </Button>

            {showQRCode && (
              <QRCodeDisplay
                url={linkGeral}
                titulo={avaliacao.nome}
              />
            )}

            {participantes.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{participantes.length} participantes • {responderam} respostas</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modo Restrito Tradicional - links individuais por participante
  return (
    <div className="space-y-6">
      {/* Card explicativo sobre modo restrito */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div>
              <CardTitle className="text-base text-amber-800 dark:text-amber-400">
                Avaliação com Acesso Restrito
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-500">
                Cada participante recebe um link único e exclusivo. 
                É necessário cadastrar os participantes antes de compartilhar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Passos visuais */}
          <div className="flex flex-wrap items-center gap-2 text-sm bg-amber-100/50 dark:bg-amber-900/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">1</span>
              <span className="text-amber-800 dark:text-amber-300">Cadastre participantes</span>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">2</span>
              <span className="text-amber-800 dark:text-amber-300">Copie links individuais</span>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">3</span>
              <span className="text-amber-800 dark:text-amber-300">Envie para cada pessoa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Links Individuais dos Participantes
          </CardTitle>
          <CardDescription>
            Esta avaliação é restrita. Cada participante possui um link único.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {participantes.length === 0 ? (
            <div className="text-center py-8 space-y-4 bg-muted/30 rounded-lg border-2 border-dashed">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="font-medium">Nenhum participante cadastrado</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Como esta avaliação é <strong>restrita</strong>, você precisa cadastrar 
                  cada participante manualmente. Cada um receberá um link único e 
                  intransferível para responder.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <Button onClick={onNavigateToParticipantes}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar Participantes
                </Button>
              </div>
              
              {/* Dica sobre auto-identificação */}
              <Alert className="mt-6 text-left max-w-lg mx-auto">
                <Info className="h-4 w-4" />
                <AlertTitle>Dica: Link Geral com Auto-identificação</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    Você também pode gerar um <strong>link único</strong> onde os próprios 
                    participantes se identificam antes de responder.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onAtivarLinkGeral || onNavigateToInformacoes}
                    disabled={isActivating}
                    className="mt-2"
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Ativar Link Geral
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-3">
              {participantes.map((participante) => {
                const linkIndividual = participante.token_acesso
                  ? `${baseUrl}/avaliacao/${avaliacao.slug || avaliacao.id}?token=${participante.token_acesso}`
                  : '';

                return (
                  <div key={participante.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {participante.nome || participante.email}
                      </span>
                      {participante.respondido && (
                        <Badge variant="secondary">Respondido</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input value={linkIndividual} readOnly className="flex-1 text-xs" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(linkIndividual, 'Link do participante')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareLink(linkIndividual)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
