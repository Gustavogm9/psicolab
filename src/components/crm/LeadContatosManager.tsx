import { useState } from "react";
import { useLeadContatos } from "@/hooks/useLeadContatos";
import { useLeadContatoMutations } from "@/hooks/useLeadContatoMutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Edit2, Trash2, User, Briefcase } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadContatosManagerProps {
  leadId: string;
}

interface ContatoFormData {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  principal: boolean;
}

export function LeadContatosManager({ leadId }: LeadContatosManagerProps) {
  const { data: contatos, isLoading } = useLeadContatos(leadId);
  const { createContato, updateContato, deleteContato, isCreating, isUpdating, isDeleting } = useLeadContatoMutations();
  
  const [dialogOpen, setDialogOpen] = useState(false);
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
          lead_id: leadId,
          ...formData,
        });
      } else {
        await createContato({
          lead_id: leadId,
          ...formData,
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
    }
  };

  const handleEdit = (contato: any) => {
    setEditingContato(contato);
    setFormData({
      nome: contato.nome || "",
      cargo: contato.cargo || "",
      email: contato.email || "",
      telefone: contato.telefone || "",
      principal: contato.principal || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (contatoId: string) => {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      await deleteContato({ id: contatoId, lead_id: leadId });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContato(null);
    setFormData({
      nome: "",
      cargo: "",
      email: "",
      telefone: "",
      principal: false,
    });
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando contatos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {contatos?.length || 0} contato(s) cadastrado(s)
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      <div className="grid gap-3">
        {contatos?.map((contato) => (
          <Card key={contato.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{contato.nome}</span>
                    {contato.principal && (
                      <Badge variant="secondary" className="text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                  
                  {contato.cargo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{contato.cargo}</span>
                    </div>
                  )}
                  
                  {contato.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{contato.email}</span>
                    </div>
                  )}
                  
                  {contato.telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{contato.telefone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(contato)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(contato.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!contatos || contatos.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum contato adicional cadastrado</p>
            <p className="text-sm">Clique em "Adicionar Contato" para começar</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContato ? 'Editar Contato' : 'Adicionar Contato'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Nome do contato"
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
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="principal"
                checked={formData.principal}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, principal: checked as boolean })
                }
              />
              <Label htmlFor="principal" className="text-sm font-normal cursor-pointer">
                Marcar como contato principal
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {editingContato ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
