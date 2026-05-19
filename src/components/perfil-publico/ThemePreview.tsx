import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ThemePreviewProps {
  corPrimaria: string;
  corSecundaria: string;
}

export const ThemePreview = ({ corPrimaria, corSecundaria }: ThemePreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Preview das Cores</CardTitle>
        <CardDescription className="text-xs">Veja como as cores ficarão no seu site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Botões</p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              style={{ 
                backgroundColor: corPrimaria,
                color: '#ffffff',
              }}
              className="hover:opacity-90"
            >
              Botão Primário
            </Button>
            <Button 
              variant="outline"
              style={{ 
                borderColor: corPrimaria,
                color: corPrimaria,
              }}
            >
              Botão Outline
            </Button>
            <Button 
              style={{ 
                backgroundColor: corSecundaria,
                color: '#ffffff',
              }}
              className="hover:opacity-90"
            >
              Botão Secundário
            </Button>
          </div>
        </div>

        {/* Títulos */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Títulos</p>
          <h2 
            className="text-2xl font-bold"
            style={{ color: corPrimaria }}
          >
            Título Principal
          </h2>
          <h3 
            className="text-lg font-semibold"
            style={{ color: corSecundaria }}
          >
            Subtítulo ou Seção
          </h3>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Badges e Destaques</p>
          <div className="flex gap-2 flex-wrap">
            <Badge 
              style={{ 
                backgroundColor: corPrimaria,
                color: '#ffffff',
              }}
            >
              Destaque
            </Badge>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: corSecundaria,
                color: corSecundaria,
              }}
            >
              Categoria
            </Badge>
          </div>
        </div>

        {/* Card de exemplo */}
        <div 
          className="p-4 rounded-lg border-2"
          style={{ borderColor: corPrimaria }}
        >
          <h4 className="font-semibold mb-2" style={{ color: corPrimaria }}>
            Card com Borda
          </h4>
          <p className="text-sm text-muted-foreground">
            Este é um exemplo de como os cards com destaque ficarão no seu site.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
