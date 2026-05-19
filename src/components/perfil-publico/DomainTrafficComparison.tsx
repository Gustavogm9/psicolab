import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Globe, 
  TrendingUp, 
  MousePointerClick, 
  Mail,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from 'lucide-react';
import { useAnalyticsPorDominio } from '@/hooks/useAnalyticsPorDominio';

interface DomainTrafficComparisonProps {
  perfilPublicoId: string;
  periodoDias?: number;
  temDominioAtivo: boolean;
}

export const DomainTrafficComparison = ({ 
  perfilPublicoId, 
  periodoDias,
  temDominioAtivo 
}: DomainTrafficComparisonProps) => {
  const { data: analytics, isLoading } = useAnalyticsPorDominio(perfilPublicoId, periodoDias);

  if (!temDominioAtivo) {
    return (
      <Alert className="border-blue-500/20 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>Configure um domínio customizado</strong> para comparar o desempenho de tráfego entre 
          seu domínio próprio e a URL padrão do Lovable.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { dominioCustomizado, urlPadrao, totalGeral } = analytics;

  // Calcular porcentagens
  const percentualCustomizado = totalGeral.visitas > 0
    ? ((dominioCustomizado.metricas.totalVisitas / totalGeral.visitas) * 100).toFixed(0)
    : 0;
  
  const percentualPadrao = totalGeral.visitas > 0
    ? ((urlPadrao.metricas.totalVisitas / totalGeral.visitas) * 100).toFixed(0)
    : 0;

  const getComparacaoIcon = (valor1: number, valor2: number) => {
    if (valor1 > valor2) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (valor1 < valor2) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getComparacaoColor = (valor1: number, valor2: number) => {
    if (valor1 > valor2) return 'text-green-600';
    if (valor1 < valor2) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Comparação de Tráfego por Origem
              </CardTitle>
              <CardDescription className="mt-1">
                Desempenho do seu domínio customizado vs URL padrão
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total de Visitas</div>
                <div className="text-2xl font-bold">{totalGeral.visitas}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total de Leads</div>
                <div className="text-2xl font-bold">{totalGeral.leads}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-l-lg flex items-center justify-center text-white text-sm font-medium" 
                 style={{ width: `${percentualCustomizado}%` }}>
              {percentualCustomizado}%
            </div>
            <div className="flex-1 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-r-lg flex items-center justify-center text-white text-sm font-medium"
                 style={{ width: `${percentualPadrao}%` }}>
              {percentualPadrao}%
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="font-medium">Domínio Customizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="font-medium">URL Padrão</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Domínio Customizado */}
        <Card className="border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Domínio Customizado
            </CardTitle>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 w-fit">
              Seu domínio próprio
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Visitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{dominioCustomizado.metricas.totalVisitas}</span>
                  {getComparacaoIcon(dominioCustomizado.metricas.totalVisitas, urlPadrao.metricas.totalVisitas)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Leads Capturados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{dominioCustomizado.metricas.totalEnviosFormulario}</span>
                  {getComparacaoIcon(dominioCustomizado.metricas.totalEnviosFormulario, urlPadrao.metricas.totalEnviosFormulario)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MousePointerClick className="w-4 h-4" />
                  <span>Taxa de Conversão</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getComparacaoColor(
                    parseFloat(dominioCustomizado.taxaConversao),
                    parseFloat(urlPadrao.taxaConversao)
                  )}`}>
                    {dominioCustomizado.taxaConversao}%
                  </span>
                  {getComparacaoIcon(
                    parseFloat(dominioCustomizado.taxaConversao),
                    parseFloat(urlPadrao.taxaConversao)
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Engajamento</div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getComparacaoColor(
                    parseFloat(dominioCustomizado.engajamento),
                    parseFloat(urlPadrao.engajamento)
                  )}`}>
                    {dominioCustomizado.engajamento}%
                  </span>
                  {getComparacaoIcon(
                    parseFloat(dominioCustomizado.engajamento),
                    parseFloat(urlPadrao.engajamento)
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• {dominioCustomizado.metricas.totalCliquesWhatsApp} cliques no WhatsApp</div>
                <div>• {dominioCustomizado.metricas.totalCliquesCTA} cliques em CTAs</div>
                <div>• {dominioCustomizado.metricas.totalCliquesServicos} cliques em serviços</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Padrão */}
        <Card className="border-gray-300/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600" />
              URL Padrão
            </CardTitle>
            <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500/20 w-fit">
              lovable.app/perfil/...
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Visitas</span>
                </div>
                <span className="text-2xl font-bold">{urlPadrao.metricas.totalVisitas}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Leads Capturados</span>
                </div>
                <span className="text-2xl font-bold">{urlPadrao.metricas.totalEnviosFormulario}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MousePointerClick className="w-4 h-4" />
                  <span>Taxa de Conversão</span>
                </div>
                <span className="text-2xl font-bold">{urlPadrao.taxaConversao}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Engajamento</div>
                <span className="text-2xl font-bold">{urlPadrao.engajamento}%</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• {urlPadrao.metricas.totalCliquesWhatsApp} cliques no WhatsApp</div>
                <div>• {urlPadrao.metricas.totalCliquesCTA} cliques em CTAs</div>
                <div>• {urlPadrao.metricas.totalCliquesServicos} cliques em serviços</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {dominioCustomizado.metricas.totalVisitas > urlPadrao.metricas.totalVisitas && (
        <Alert className="border-green-500/20 bg-green-500/5">
          <TrendingUp className="h-4 h-4 text-green-600" />
          <AlertDescription>
            <strong>Ótimo desempenho!</strong> Seu domínio customizado está gerando{' '}
            {((dominioCustomizado.metricas.totalVisitas / (urlPadrao.metricas.totalVisitas || 1)) * 100 - 100).toFixed(0)}%
            {' '}mais tráfego que a URL padrão. Continue investindo na divulgação do seu domínio próprio!
          </AlertDescription>
        </Alert>
      )}

      {parseFloat(dominioCustomizado.taxaConversao) > parseFloat(urlPadrao.taxaConversao) && (
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <MousePointerClick className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Maior conversão no domínio próprio!</strong> Visitantes do seu domínio customizado 
            convertem {dominioCustomizado.taxaConversao}% vs {urlPadrao.taxaConversao}% da URL padrão. 
            Isso indica maior confiança na marca!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
