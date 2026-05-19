import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  url: string;
  titulo: string;
}

export const QRCodeDisplay = ({ url, titulo }: QRCodeDisplayProps) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  
  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-code-${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("QR Code baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error("Erro ao baixar QR Code. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <h3 className="text-lg font-semibold">QR Code</h3>
      
      <div className="p-4 bg-white rounded-lg border-2 border-dashed border-muted-foreground/20">
        <img 
          src={qrCodeUrl} 
          alt={`QR Code para ${titulo}`}
          className="w-[200px] h-[200px] object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>
      
      <Button 
        variant="outline" 
        onClick={downloadQRCode}
        className="w-full max-w-xs"
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar QR Code
      </Button>
    </div>
  );
};
