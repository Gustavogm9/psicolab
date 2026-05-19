import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClienteContatos } from "@/hooks/useClienteContatos";
import { useContatoMutations } from "@/hooks/useContatoMutations";
import { Plus, Mail, Phone, Briefcase, Star, Trash2, Edit2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ContatosManagerProps {
  clienteId: string;
}

interface ContatoFormData {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  principal: boolean;
}

export function ContatosManager({ clienteId }: ContatosManagerProps) {
  const { data: contatos, isLoading } = useClienteContatos(clienteId);
  const { createContato, updateContato, deleteContato, isCreating, isUpdating, isDeleting } = useContatoMutations();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContato, setEditingContato] = useState<any>(null);
  const [formData, setFormData] = useState<ContatoFormData>({
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    principal: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingContato) {
        await updateContato({
          id: editingContato.id,
          cliente_id: clienteId,
          ...formData,
        });
      } else {
        await createContato({
          cliente_id: clienteId,
          ...formData,
        });
      }
      
      setIsDialogOpen(false);
      setEditingContato(null);
      setFormData({ nome: "", cargo: "", email: "", telefone: "", principal: false });
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
    }
  };

  const handleEdit = (contato: any) => {
    setEditingContato(contato);
    setFormData({
      nome: contato.nome,
      cargo: contato.cargo || "",
      email: contato.email,
      telefone: contato.telefone || "",
      principal: contato.principal,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (contatoId: string) => {
    if (confirm("Deseja realmente remover este contato?")) {
      await deleteContato({ id: contatoId, cliente_id: clienteId });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingContato(null);
    setFormData({ nome: "", cargo: "", email: "", telefone: "", principal: false });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando contatos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContato ? "Editar Contato" : "Novo Contato"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Gerente de RH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="principal"
                  checked={formData.principal}
                  onCheckedChange={(checked) => setFormData({ ...formData, principal: checked })}
                />
                <Label htmlFor="principal" className="cursor-pointer">
                  Marcar como contato principal
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {editingContato ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {contatos && contatos.length > 0 ? (
          contatos.map((contato) => (
            <Card key={contato.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{contato.nome}</h4>
                    {contato.principal && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  
                  {contato.cargo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {contato.cargo}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {contato.email}
                  </div>
                  
                  {contato.telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {contato.telefone}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(contato)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(contato.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum contato cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
