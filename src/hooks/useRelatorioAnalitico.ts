import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

export interface ReceitaMensal {
  mes: string;
  receita: number;
  faturas: number;
}

export interface ClienteReceita {
  cliente_id: string;
  cliente_nome: string;
  receita_total: number;
  faturas_pagas: number;
  faturas_pendentes: number;
  faturas_atrasadas: number;
  taxa_inadimplencia: number;
}

export interface DistribuicaoStatus {
  status: string;
  quantidade: number;
  valor: number;
  cor: string;
}

export function useRelatorioAnalitico() {
  const { effectiveUserId } = useAuth();

  // Buscar receita mensal dos últimos 6 meses
  const { data: receitaMensal, isLoading: receitaLoading } = useQuery({
    queryKey: ['relatorio-receita-mensal', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const meses: ReceitaMensal[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const mesData = subMonths(new Date(), i);
        const dataInicio = format(startOfMonth(mesData), 'yyyy-MM-dd');
        const dataFim = format(
          new Date(mesData.getFullYear(), mesData.getMonth() + 1, 0),
          'yyyy-MM-dd'
        );

        const { data, error } = await supabase
          .from('faturas')
          .select('valor, status')
          .eq('consultora_id', effectiveUserId)
          .gte('data_vencimento', dataInicio)
          .lte('data_vencimento', dataFim);

        if (error) throw error;

        const receitaPaga = data
          ?.filter(f => f.status === 'pago')
          .reduce((sum, f) => sum + Number(f.valor), 0) || 0;

        meses.push({
          mes: format(mesData, 'MMM', { locale: ptBR }),
          receita: receitaPaga,
          faturas: data?.length || 0,
        });
      }

      return meses;
    },
  });

  // Buscar top 10 clientes por receita
  const { data: topClientes, isLoading: clientesLoading } = useQuery({
    queryKey: ['relatorio-top-clientes', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: faturas, error } = await supabase
        .from('faturas')
        .select(`
          valor,
          status,
          cliente_id,
          clientes (
            nome
          )
        `)
        .eq('consultora_id', effectiveUserId);

      if (error) throw error;

      // Agrupar por cliente
      const clientesMap = new Map<string, ClienteReceita>();

      faturas?.forEach((fatura) => {
        const clienteId = fatura.cliente_id;
        const clienteNome = (fatura.clientes as any)?.nome || 'Cliente';
        
        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            cliente_id: clienteId,
            cliente_nome: clienteNome,
            receita_total: 0,
            faturas_pagas: 0,
            faturas_pendentes: 0,
            faturas_atrasadas: 0,
            taxa_inadimplencia: 0,
          });
        }

        const cliente = clientesMap.get(clienteId)!;
        const valor = Number(fatura.valor);

        if (fatura.status === 'pago') {
          cliente.receita_total += valor;
          cliente.faturas_pagas++;
        } else if (fatura.status === 'pendente') {
          cliente.faturas_pendentes++;
        } else if (fatura.status === 'atrasado') {
          cliente.faturas_atrasadas++;
        }
      });

      // Calcular taxa de inadimplência
      clientesMap.forEach((cliente) => {
        const totalFaturas = cliente.faturas_pagas + cliente.faturas_pendentes + cliente.faturas_atrasadas;
        if (totalFaturas > 0) {
          cliente.taxa_inadimplencia = (cliente.faturas_atrasadas / totalFaturas) * 100;
        }
      });

      // Ordenar por receita e pegar top 10
      return Array.from(clientesMap.values())
        .sort((a, b) => b.receita_total - a.receita_total)
        .slice(0, 10);
    },
  });

  // Buscar distribuição por status
  const { data: distribuicaoStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['relatorio-distribuicao-status', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: faturas, error } = await supabase
        .from('faturas')
        .select('valor, status')
        .eq('consultora_id', effectiveUserId);

      if (error) throw error;

      const statusMap = new Map<string, { quantidade: number; valor: number }>();

      faturas?.forEach((fatura) => {
        const status = fatura.status;
        if (!statusMap.has(status)) {
          statusMap.set(status, { quantidade: 0, valor: 0 });
        }
        const info = statusMap.get(status)!;
        info.quantidade++;
        info.valor += Number(fatura.valor);
      });

      const cores: Record<string, string> = {
        pago: '#22c55e',
        pendente: '#eab308',
        atrasado: '#ef4444',
      };

      const labels: Record<string, string> = {
        pago: 'Pagas',
        pendente: 'Pendentes',
        atrasado: 'Atrasadas',
      };

      const resultado: DistribuicaoStatus[] = [];
      statusMap.forEach((info, status) => {
        resultado.push({
          status: labels[status] || status,
          quantidade: info.quantidade,
          valor: info.valor,
          cor: cores[status] || '#6b7280',
        });
      });

      return resultado;
    },
  });

  return {
    receitaMensal,
    topClientes,
    distribuicaoStatus,
    isLoading: receitaLoading || clientesLoading || statusLoading,
  };
}
