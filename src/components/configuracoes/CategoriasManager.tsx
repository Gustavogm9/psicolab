import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCategoriasPersonalizadas, Categoria } from '@/hooks/useCategoriasPersonalizadas';
import { useCategoriasMutations } from '@/hooks/useCategoriasMutations';

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

export const CategoriasManager = () => {
  const [tipoAtivo, setTipoAtivo] = useState<'questionario' | 'avaliacao' | 'intervencao' | 'evento'>('questionario');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<string | null>(null);
  
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#6366f1');

  const { data: categoriasRaw = [] } = useCategoriasPersonalizadas({ tipo: tipoAtivo });
  const { criarCategoria, atualizarCategoria, deletarCategoria } = useCategoriasMutations();

  // Deduplicar categorias por nome para evitar problemas de sincronização ou base duplicada
  const categorias = categoriasRaw.reduce((acc: Categoria[], current) => {
    const exists = acc.some(
      item => item.nome.trim().toLowerCase() === current.nome.trim().toLowerCase()
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const categoriasCustomizadas = categorias.filter(cat => !cat.isSystem);
  const categoriasSistema = categorias.filter(cat => cat.isSystem);

  const abrirDialogNova = () => {
    setEditandoCategoria(null);
    setNome('');
    setCor('#6366f1');
    setDialogAberto(true);
  };

  const abrirDialogEdicao = (categoria: Categoria) => {
    setEditandoCategoria(categoria);
    setNome(categoria.nome);
    setCor(categoria.cor);
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!nome.trim()) return;

    if (editandoCategoria) {
      await atualizarCategoria.mutateAsync({
        id: editandoCategoria.id,
        nome,
        cor,
      });
    } else {
      await criarCategoria.mutateAsync({
        nome,
        tipo: tipoAtivo,
        cor,
      });
    }

    setDialogAberto(false);
    setEditandoCategoria(null);
    setNome('');
    setCor('#6366f1');
  };

  const handleDeletar = async () => {
    if (!categoriaParaDeletar) return;
    await deletarCategoria.mutateAsync(categoriaParaDeletar);
    setCategoriaParaDeletar(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categorias Personalizadas</CardTitle>
              <CardDescription>
                Gerencie suas categorias personalizadas para questionários, avaliações, intervenções e eventos
              </CardDescription>
            </div>
            <Button onClick={abrirDialogNova}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tipoAtivo} onValueChange={(v: any) => setTipoAtivo(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="questionario">Questionários</TabsTrigger>
              <TabsTrigger value="avaliacao">Avaliações</TabsTrigger>
              <TabsTrigger value="intervencao">Intervenções</TabsTrigger>
              <TabsTrigger value="evento">Eventos</TabsTrigger>
            </TabsList>

            <TabsContent value={tipoAtivo} className="space-y-4 mt-4">
              {/* Categorias do Sistema */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Categorias Padrão</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoriasSistema.map((categoria) => (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <Badge
                        variant="secondary"
                        className="font-medium"
                        style={{ 
                          backgroundColor: `${categoria.cor}40`,
                          color: '#1f2937',
                          borderColor: categoria.cor,
                          borderWidth: '1px'
                        }}
                      >
                        {categoria.nome}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Sistema</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias Customizadas */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Minhas Categorias</h3>
                {categoriasCustomizadas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma categoria personalizada criada ainda.</p>
                    <p className="text-sm mt-1">Clique em "Nova Categoria" para começar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoriasCustomizadas.map((categoria) => (
                      <div
                        key={categoria.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <Badge
                          variant="secondary"
                          className="font-medium"
                          style={{ 
                            backgroundColor: `${categoria.cor}40`,
                            color: '#1f2937',
                            borderColor: categoria.cor,
                            borderWidth: '1px'
                          }}
                        >
                          {categoria.nome}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirDialogEdicao(categoria)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoriaParaDeletar(categoria.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editandoCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editandoCategoria
                ? 'Atualize as informações da categoria'
                : 'Crie uma nova categoria personalizada'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Onboarding"
              />
            </div>
            <div>
              <Label htmlFor="cor">Cor</Label>
              <Select value={cor} onValueChange={setCor}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: cor }}
                      />
                      {CORES_DISPONIVEIS.find(c => c.valor === cor)?.nome || 'Selecione'}
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
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={!nome.trim()}>
              {editandoCategoria ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar */}
      <AlertDialog
        open={!!categoriaParaDeletar}
        onOpenChange={() => setCategoriaParaDeletar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será removida, mas questionários
              que já a utilizam não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletar}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
