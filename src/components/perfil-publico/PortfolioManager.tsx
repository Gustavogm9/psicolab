import { useState } from "react";
import { Plus, Upload, X, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePortfolioImagens, usePortfolioImagensMutations, PortfolioImagem } from "@/hooks/usePortfolioImagens";

interface PortfolioManagerProps {
  perfilPublicoId: string;
}

export function PortfolioManager({ perfilPublicoId }: PortfolioManagerProps) {
  const { data: imagens = [], isLoading } = usePortfolioImagens(perfilPublicoId);
  const mutations = usePortfolioImagensMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imagemToDelete, setImagemToDelete] = useState<PortfolioImagem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    file: null as File | null,
    titulo: "",
    descricao: "",
    categoria: "",
    destaque: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    await mutations.create({
      file: formData.file,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      categoria: formData.categoria || undefined,
      destaque: formData.destaque,
      ordem: imagens.length,
      perfilPublicoId,
    });

    setFormData({
      file: null,
      titulo: "",
      descricao: "",
      categoria: "",
      destaque: false,
    });
    setPreview(null);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!imagemToDelete) return;
    await mutations.delete({
      id: imagemToDelete.id,
      imagemUrl: imagemToDelete.imagem_url,
      perfilPublicoId,
    });
    setDeleteDialogOpen(false);
    setImagemToDelete(null);
  };

  const handleToggleDestaque = async (imagem: PortfolioImagem) => {
    await mutations.update({
      id: imagem.id,
      destaque: !imagem.destaque,
      perfilPublicoId,
    });
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {imagens.length} {imagens.length === 1 ? "imagem" : "imagens"} no portfólio
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Imagem ao Portfólio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file">Imagem *</Label>
                <div className="mt-2">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFormData({ ...formData, file: null });
                          setPreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </span>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  placeholder="Ex: Certificação, Projeto, Case de Sucesso"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="destaque"
                  checked={formData.destaque}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, destaque: checked })
                  }
                />
                <Label htmlFor="destaque">Marcar como destaque</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutations.isCreating}>
                  {mutations.isCreating ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imagens.map((imagem) => (
          <Card key={imagem.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={imagem.imagem_url}
                alt={imagem.titulo}
                className="w-full h-full object-cover"
              />
              {imagem.destaque && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-1">{imagem.titulo}</h4>
              {imagem.descricao && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {imagem.descricao}
                </p>
              )}
              {imagem.categoria && (
                <Badge variant="outline" className="mb-2">
                  {imagem.categoria}
                </Badge>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleDestaque(imagem)}
                  disabled={mutations.isUpdating}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {imagem.destaque ? "Remover" : "Destacar"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setImagemToDelete(imagem);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={mutations.isDeleting}
                >
                  <X className="w-3 h-3 mr-1" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta imagem do portfólio? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
