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
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DuplicateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLead: any;
  onCreateAnyway: () => void;
}

export function DuplicateLeadDialog({
  open,
  onOpenChange,
  existingLead,
  onCreateAnyway,
}: DuplicateLeadDialogProps) {
  const navigate = useNavigate();

  if (!existingLead) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Lead Duplicado Detectado</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Já existe um lead com este email no sistema:</p>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <strong>{existingLead.nome}</strong>
                  <Badge>{existingLead.status_crm}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{existingLead.email}</p>
                {existingLead.empresa && (
                  <p className="text-sm text-muted-foreground">{existingLead.empresa}</p>
                )}
              </div>
              <p className="text-sm">O que você gostaria de fazer?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              navigate(`/crm/${existingLead.id}`);
              onOpenChange(false);
            }}
          >
            Ver Lead Existente
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              onCreateAnyway();
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Criar Mesmo Assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
