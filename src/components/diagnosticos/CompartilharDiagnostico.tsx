import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Copy, ExternalLink, QrCode, Share2 } from 'lucide-react';
import { QRCodeDisplay } from '../avaliacoes/QRCodeDisplay';
import { useState } from 'react';
import { useActiveDomain } from '@/hooks/useActiveDomain';

interface CompartilharDiagnosticoProps {
  diagnostico: {
    id: string;
    titulo: string;
    slug: string;
  };
}

export const CompartilharDiagnostico = ({ diagnostico }: CompartilharDiagnosticoProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { data: activeDomain } = useActiveDomain();
  
  const baseUrl = activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}` 
    : window.location.origin;
  
  const linkPublico = `${baseUrl}/q/${diagnostico.slug}`;

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
          title: diagnostico.titulo,
          text: `Responda ao diagnóstico: ${diagnostico.titulo}`,
          url: url,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      copyToClipboard(url, 'Link');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Diagnóstico
          </CardTitle>
          <CardDescription>
            Compartilhe este diagnóstico com qualquer pessoa através do link público.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Link do Diagnóstico</Label>
            <div className="flex gap-2">
              <Input value={linkPublico} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(linkPublico, 'Link')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(linkPublico, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareLink(linkPublico)}
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
              url={linkPublico}
              titulo={diagnostico.titulo}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
