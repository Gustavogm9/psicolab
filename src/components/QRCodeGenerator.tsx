import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Copy, 
  Share2, 
  ExternalLink,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { useActiveDomain } from "@/hooks/useActiveDomain";

interface QRCodeGeneratorProps {
  questionarioSlug: string;
  questionarioTitulo: string;
  baseUrl?: string;
}

const QRCodeGenerator = ({ 
  questionarioSlug, 
  questionarioTitulo, 
  baseUrl 
}: QRCodeGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const { data: activeDomain } = useActiveDomain();
  
  const finalBaseUrl = baseUrl || (activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}` 
    : window.location.origin);
  
  const questionarioUrl = `${finalBaseUrl}/q/${questionarioSlug}`;
  
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(questionarioUrl)}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(questionarioUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };
  
  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-code-${questionarioSlug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("QR Code baixado!");
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error("Erro ao baixar QR Code");
    }
  };
  
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: questionarioTitulo,
          text: `Responda: ${questionarioTitulo}`,
          url: questionarioUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };
  
  const openInNewTab = () => {
    window.open(questionarioUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* QR Code Image - Compacto */}
      <div className="flex justify-center">
        <div className="p-3 bg-white rounded-lg border">
          <img 
            src={qrCodeUrl} 
            alt={`QR Code para ${questionarioTitulo}`}
            className="w-36 h-36 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>
      </div>
      
      {/* URL Display - Compacto */}
      <div className="flex gap-2">
        <Input 
          value={questionarioUrl} 
          readOnly 
          className="font-mono text-xs"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={copyToClipboard}
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Action Buttons - Grid compacto */}
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={downloadQRCode}
        >
          <Download className="h-4 w-4 mr-1" />
          Baixar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={shareQRCode}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Enviar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={openInNewTab}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Abrir
        </Button>
      </div>
      
      {/* Instrução simplificada */}
      <p className="text-xs text-muted-foreground text-center">
        Escaneie com a câmera do celular ou copie o link
      </p>
    </div>
  );
};

export default QRCodeGenerator;
