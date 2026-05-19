import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategoriasPersonalizadas } from '@/hooks/useCategoriasPersonalizadas';
import { useCategoriasMutations } from '@/hooks/useCategoriasMutations';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const CORES_DISPONIVEIS = [
  { nome: 'Índigo', valor: '#6366f1' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Amarelo', valor: '#f59e0b' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Turquesa', valor: '#14b8a6' },
  { nome: 'Vermelho', valor: '#ef4444' },
];

interface CategoriaSelectorProps {
  tipo: 'questionario' | 'avaliacao' | 'intervencao' | 'evento';
  value: string;
  onChange: (value: string) => void;
  allowCreate?: boolean;
}

export const CategoriaSelector = ({
  tipo,
  value,
  onChange,
  allowCreate = true,
}: CategoriaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#6366f1');

  const { data: categorias = [], isLoading } = useCategoriasPersonalizadas({ tipo });
  const { criarCategoria } = useCategoriasMutations();

  const handleCriarCategoria = async () => {
    if (!novoNome.trim()) return;

    await criarCategoria.mutateAsync({
      nome: novoNome,
      tipo,
      cor: novaCor,
    });

    setNovoNome('');
    setNovaCor('#6366f1');
    setDialogOpen(false);
    onChange(novoNome);
  };

  const categoriaSelecionada = categorias.find(cat => cat.nome === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {categoriaSelecionada ? (
              <Badge
                variant="secondary"
                style={{ 
                  backgroundColor: categoriaSelecionada.isSystem ? categoriaSelecionada.cor : `${categoriaSelecionada.cor}40`,
                  color: categoriaSelecionada.isSystem ? 'white' : '#374151'
                }}
                className={cn("font-normal", categoriaSelecionada.isSystem && "font-medium")}
              >
                {categoriaSelecionada.nome}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Selecione uma categoria...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-background" align="start">
          <Command>
            <CommandInput placeholder="Buscar categoria..." />
            <CommandList>
              <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
              
              {/* Categorias do Sistema */}
              <CommandGroup heading="Categorias Padrão">
                {categorias
                  .filter(cat => cat.isSystem)
                  .map((categoria) => (
                    <CommandItem
                      key={categoria.id}
                      value={categoria.nome}
                      onSelect={() => {
                        onChange(categoria.nome);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === categoria.nome ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <Badge
                        variant="secondary"
                        style={{ 
                          backgroundColor: categoria.isSystem ? categoria.cor : `${categoria.cor}40`,
                          color: categoria.isSystem ? 'white' : '#374151'
                        }}
                        className={cn("font-normal", categoria.isSystem && "font-medium")}
                      >
                        {categoria.nome}
                      </Badge>
                    </CommandItem>
                  ))}
              </CommandGroup>

              {/* Categorias Customizadas */}
              {categorias.some(cat => !cat.isSystem) && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Minhas Categorias">
                    {categorias
                      .filter(cat => !cat.isSystem)
                      .map((categoria) => (
                        <CommandItem
                          key={categoria.id}
                          value={categoria.nome}
                          onSelect={() => {
                            onChange(categoria.nome);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === categoria.nome ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <Badge
                            variant="secondary"
                            style={{ 
                              backgroundColor: categoria.isSystem ? categoria.cor : `${categoria.cor}40`,
                              color: categoria.isSystem ? 'white' : '#374151'
                            }}
                            className={cn("font-normal", categoria.isSystem && "font-medium")}
                          >
                            {categoria.nome}
                          </Badge>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}

              {/* Criar Nova */}
              {allowCreate && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nova categoria
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog para criar nova categoria */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria personalizada para seus questionários.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Onboarding"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCriarCategoria();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="cor">Cor</Label>
              <Select value={novaCor} onValueChange={setNovaCor}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: novaCor }}
                      />
                      {CORES_DISPONIVEIS.find(c => c.valor === novaCor)?.nome || 'Selecione'}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CORES_DISPONIVEIS.map((corOpcao) => (
                    <SelectItem key={corOpcao.valor} value={corOpcao.valor}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: corOpcao.valor }}
                        />
                        {corOpcao.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarCategoria}
              disabled={!novoNome.trim() || criarCategoria.isPending}
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
