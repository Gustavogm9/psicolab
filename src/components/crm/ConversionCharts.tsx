import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface Lead {
  id: string;
  status_crm: string;
  origem: string;
  categoria: string;
  score: number;
  created_at: string;
}

interface ConversionChartsProps {
  leads: Lead[];
}

const COLORS = {
  novo: '#3b82f6',
  contatado: '#eab308',
  qualificado: '#a855f7',
  negociacao: '#f97316',
  convertido: '#22c55e',
};

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
  conversao: {
    label: 'Conversão',
    color: 'hsl(var(--chart-2))',
  },
};

export function ConversionCharts({ leads }: ConversionChartsProps) {
  // Funil de conversão
  const funnelData = [
    { name: 'Novo', value: leads.filter(l => l.status_crm === 'novo').length },
    { name: 'Contatado', value: leads.filter(l => l.status_crm === 'contatado').length },
    { name: 'Qualificado', value: leads.filter(l => l.status_crm === 'qualificado').length },
    { name: 'Negociação', value: leads.filter(l => l.status_crm === 'negociacao').length },
    { name: 'Convertido', value: leads.filter(l => l.status_crm === 'convertido').length },
  ];

  // Conversão por origem
  const origemStats = leads.reduce((acc, lead) => {
    if (!acc[lead.origem]) {
      acc[lead.origem] = { total: 0, convertidos: 0 };
    }
    acc[lead.origem].total++;
    if (lead.status_crm === 'convertido') {
      acc[lead.origem].convertidos++;
    }
    return acc;
  }, {} as Record<string, { total: number; convertidos: number }>);

  const conversionByOrigin = Object.entries(origemStats).map(([origem, stats]) => ({
    origem,
    total: stats.total,
    convertidos: stats.convertidos,
    taxa: stats.total > 0 ? ((stats.convertidos / stats.total) * 100).toFixed(1) : 0,
  }));

  // Timeline de conversões (últimos 30 dias)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const timelineData = last30Days.map(date => {
    const leadsCreated = leads.filter(l => 
      l.created_at?.startsWith(date)
    ).length;
    
    const leadsConverted = leads.filter(l => 
      l.status_crm === 'convertido' && l.created_at?.startsWith(date)
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      leads: leadsCreated,
      convertidos: leadsConverted,
    };
  });

  // Distribuição por categoria
  const categoryData = leads.reduce((acc, lead) => {
    if (!acc[lead.categoria]) {
      acc[lead.categoria] = 0;
    }
    acc[lead.categoria]++;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Funil de Conversão */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-base">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Conversão por Origem */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-base">Taxa de Conversão por Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionByOrigin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="origem" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" />
                <Bar dataKey="convertidos" fill="hsl(var(--chart-2))" name="Convertidos" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Timeline de Conversões */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-base">Timeline (Últimos 30 Dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Leads Gerados"
                />
                <Line 
                  type="monotone" 
                  dataKey="convertidos" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Convertidos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
