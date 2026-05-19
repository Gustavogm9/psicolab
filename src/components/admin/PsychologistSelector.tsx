import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useImpersonation } from "@/hooks/useImpersonation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCog, Search, Loader2, Mail, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWhiteLabelContext } from "@/contexts/WhiteLabelContext";
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

export function PsychologistSelector() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refetch: refetchWhiteLabel } = useWhiteLabelContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { startImpersonation } = useImpersonation();

  // Buscar todos os psicólogos (não-admins) com dados completos
  const { data: psychologists, isLoading } = useQuery({
    queryKey: ["psychologists-for-impersonation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_users_for_impersonation");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredPsychologists = psychologists?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.company?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSelectPsychologist = (userId: string) => {
    setSelectedUserId(userId);
    setShowConfirm(true);
  };

  const handleConfirmImpersonation = async () => {
    if (!selectedUserId) return;

    setIsStarting(true);
    const result = await startImpersonation(selectedUserId);
    setIsStarting(false);

    if (result.success) {
      // Aguardar ciclo de renderização para garantir que o estado do contexto foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refazer busca das configurações de marca para aplicar tema do usuário impersonificado
      await refetchWhiteLabel();
      
      // Invalidar todas as queries para forçar refetch com novo effectiveUserId
      await queryClient.invalidateQueries();
      
      toast.success("Impersonificação iniciada com sucesso!");
      
      // Buscar role do usuário impersonificado para redirecionar
      const targetPsychologist = psychologists?.find(p => p.id === selectedUserId);
      const targetRole = targetPsychologist?.role;

      // Redirecionar para dashboard correto
      if (targetRole === "consultora") {
        navigate("/dashboard/consultora");
      } else if (targetRole === "gestor") {
        navigate("/dashboard/gestor");
      } else {
        navigate("/dashboard/consultora"); // fallback
      }

      setShowConfirm(false);
      setOpen(false);
      setSearch("");
      setSelectedUserId(null);
    } else {
      toast.error(result.error || "Erro ao iniciar impersonificação");
    }
  };

  const selectedPsychologist = psychologists?.find(p => p.id === selectedUserId);

  const translateRole = (role: string | null): string => {
    switch (role) {
      case 'gestor': return 'Gestor';
      case 'consultora': return 'Consultora';
      case 'moderator': return 'Moderador';
      default: return 'Usuário';
    }
  };

  const getRoleBadgeVariant = (role: string | null): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'gestor': return 'default';
      case 'consultora': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <UserCog className="h-4 w-4" />
            Impersonificar Psicólogo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Psicólogo</DialogTitle>
            <DialogDescription>
              Escolha um psicólogo para acessar seu painel e realizar ações em seu nome.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertDescription className="text-sm">
              ⚠️ Todas as ações realizadas durante a impersonificação serão registradas
              em logs de auditoria com seu ID de administrador.
            </AlertDescription>
          </Alert>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPsychologists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <UserCog className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-sm">Nenhum psicólogo encontrado</p>
              </div>
            ) : (
              filteredPsychologists.map((psychologist) => (
                <div
                  key={psychologist.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectPsychologist(psychologist.id)}
                >
                  <Avatar>
                    <AvatarImage src={psychologist.avatar_url || undefined} />
                    <AvatarFallback>
                      {psychologist.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{psychologist.name}</p>
                      <Badge variant={getRoleBadgeVariant(psychologist.role)}>
                        {translateRole(psychologist.role)}
                      </Badge>
                    </div>
                    {psychologist.company && (
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {psychologist.company}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{psychologist.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Criado: {format(new Date(psychologist.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {psychologist.last_sign_in_at 
                            ? `Acesso: ${formatDistanceToNow(new Date(psychologist.last_sign_in_at), { addSuffix: true, locale: ptBR })}`
                            : "Nunca acessou"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Acessar
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Impersonificação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a acessar o sistema como{" "}
                <strong>{selectedPsychologist?.name}</strong>.
              </p>
              <p className="text-destructive font-medium">
                ⚠️ Aviso de Responsabilidade:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Todas as suas ações serão registradas em logs de auditoria</li>
                <li>Você terá acesso completo aos dados do psicólogo</li>
                <li>Use esta funcionalidade apenas para suporte autorizado</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStarting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImpersonation}
              disabled={isStarting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                "Confirmar Impersonificação"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
