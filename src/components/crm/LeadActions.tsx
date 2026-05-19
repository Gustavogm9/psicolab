import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
}

interface LeadActionsProps {
  lead: Lead;
  onAgendar: () => void;
}

export function LeadActions({ lead, onAgendar }: LeadActionsProps) {
  const handleEmail = () => {
    const subject = `Contato - ${lead.nome}`;
    const body = `Olá ${lead.nome},\n\n`;
    window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: 'E-mail aberto',
      description: 'Cliente de e-mail aberto para contato.',
    });
  };

  const handleWhatsApp = () => {
    if (!lead.telefone) {
      toast({
        title: 'Telefone não cadastrado',
        description: 'Adicione um telefone para enviar mensagem no WhatsApp.',
        variant: 'destructive',
      });
      return;
    }
    
    const phone = lead.telefone.replace(/\D/g, '');
    const message = `Olá ${lead.nome}! Tudo bem?`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    
    toast({
      title: 'WhatsApp aberto',
      description: 'Nova janela aberta para conversa no WhatsApp.',
    });
  };

  const handleCall = () => {
    if (!lead.telefone) {
      toast({
        title: 'Telefone não cadastrado',
        description: 'Adicione um telefone para realizar a ligação.',
        variant: 'destructive',
      });
      return;
    }
    
    window.location.href = `tel:${lead.telefone}`;
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEmail}
        className="w-full"
        disabled={!lead.email || lead.email.trim() === ''}
      >
        <Mail className="h-4 w-4 mr-2" />
        E-mail
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        className="w-full"
      >
        <Phone className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCall}
        className="w-full"
      >
        <Phone className="h-4 w-4 mr-2" />
        Ligar
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onAgendar}
        className="w-full"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Agendar
      </Button>
    </div>
  );
}
