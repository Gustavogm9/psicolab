import { useState, useEffect } from 'react';

interface CRMFilters {
  busca: string;
  filtroStatus: string;
  filtroOrigem: string;
  filtroValor: [number, number];
  filtroPeriodo: { start?: Date; end?: Date };
  viewMode: 'list' | 'kanban' | 'charts' | 'clientes';
}

const STORAGE_KEY = 'crm-filters';

const defaultFilters: CRMFilters = {
  busca: '',
  filtroStatus: 'todos',
  filtroOrigem: 'todos',
  filtroValor: [0, 100000],
  filtroPeriodo: {},
  viewMode: 'list',
};

export function useFilterPersistence() {
  const [filters, setFiltersState] = useState<CRMFilters>(() => {
    // Tentar carregar filtros salvos do localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
        if (parsed.filtroPeriodo?.start) {
          parsed.filtroPeriodo.start = new Date(parsed.filtroPeriodo.start);
        }
        if (parsed.filtroPeriodo?.end) {
          parsed.filtroPeriodo.end = new Date(parsed.filtroPeriodo.end);
        }
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error);
    }
    return defaultFilters;
  });

  // Salvar filtros no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Erro ao salvar filtros:', error);
    }
  }, [filters]);

  const setFilters = (updates: Partial<CRMFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
    localStorage.removeItem(STORAGE_KEY);
  };

  const clearSearchAndFilters = () => {
    setFiltersState({
      ...defaultFilters,
      viewMode: filters.viewMode, // Manter apenas o modo de visualização
    });
  };

  return {
    filters,
    setFilters,
    resetFilters,
    clearSearchAndFilters,
  };
}
