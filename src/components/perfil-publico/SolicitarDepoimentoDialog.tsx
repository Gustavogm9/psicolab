import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useActiveDomain } from "@/hooks/useActiveDomain";

interface SolicitarDepoimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfilSlug: string;
}

export function SolicitarDepoimentoDialog({ open, onOpenChange, perfilSlug }: SolicitarDepoimentoDialogProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const { data: activeDomain } = useActiveDomain();

  const baseUrl = activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}` 
    : window.location.origin;
  
  const linkDepoimento = `${baseUrl}/perfil/${perfilSlug}/depoimento`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkDepoimento);
      setLinkCopiado(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleSendEmail = async () => {
    if (!nome.trim() || !email.trim()) {
      toast.error("Preencha nome e email do cliente");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido");
      return;
    }

    setIsSending(true);
    try {
      // Simular envio de email (implementar edge function depois)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(
        `✅ Convite enviado para ${nome}!`,
        {
          description: 'O cliente receberá um link para deixar seu depoimento.'
        }
      );
      setNome("");
      setEmail("");
      setMensagemPersonalizada("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar Depoimento</DialogTitle>
          <DialogDescription>
            Envie um convite para clientes deixarem um depoimento sobre seu trabalho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link público */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">Link Público de Depoimentos</Label>
            <div className="flex gap-2">
              <Input
                value={linkDepoimento}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {linkCopiado ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe este link com clientes para que eles possam deixar depoimentos
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou envie por email
              </span>
            </div>
          </div>

          {/* Formulário de envio */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email do Cliente *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="mensagem"
                value={mensagemPersonalizada}
                onChange={(e) => setMensagemPersonalizada(e.target.value)}
                placeholder="Escreva uma mensagem personalizada para o cliente..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem será incluída no email de convite
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending || !nome.trim() || !email.trim()}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
