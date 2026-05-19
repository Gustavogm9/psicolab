import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type PeriodFilter = '7d' | '30d' | '90d' | 'all';

interface AnalyticsPeriodFilterProps {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}

export const AnalyticsPeriodFilter = ({ value, onChange }: AnalyticsPeriodFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Últimos 7 dias</SelectItem>
        <SelectItem value="30d">Últimos 30 dias</SelectItem>
        <SelectItem value="90d">Últimos 90 dias</SelectItem>
        <SelectItem value="all">Todo o período</SelectItem>
      </SelectContent>
    </Select>
  );
};
