import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClientes } from "@/hooks/useClientes";
import type { EventoFilters as Filters } from "@/hooks/useEventos";

interface EventoFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function EventoFilters({ filters, onFiltersChange }: EventoFiltersProps) {
  const { data: clientes } = useClientes();
  
  const hasActiveFilters = 
    (filters.cliente_id && filters.cliente_id !== 'todos') ||
    (filters.tipo && filters.tipo !== 'todos') ||
    (filters.status && filters.status !== 'todos') ||
    filters.periodo ||
    filters.busca;
  
  const clearFilters = () => {
    onFiltersChange({
      cliente_id: 'todos',
      tipo: 'todos',
      status: 'todos',
      periodo: undefined,
      busca: '',
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          value={filters.busca || ''}
          onChange={(e) => onFiltersChange({ ...filters, busca: e.target.value })}
          className="pl-9"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select
          value={filters.cliente_id || 'todos'}
          onValueChange={(value) => onFiltersChange({ ...filters, cliente_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            <SelectItem value="sem_cliente">Sem cliente</SelectItem>
            {clientes?.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.tipo || 'todos'}
          onValueChange={(value) => onFiltersChange({ ...filters, tipo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="follow_up">Follow-up</SelectItem>
            <SelectItem value="reuniao">Reunião</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="consultoria">Consultoria</SelectItem>
            <SelectItem value="avaliacao">Avaliação</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status || 'todos'}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="realizado">Realizado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.periodo || 'todos'}
          onValueChange={(value) => onFiltersChange({ ...filters, periodo: value === 'todos' ? undefined : value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os períodos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os períodos</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
