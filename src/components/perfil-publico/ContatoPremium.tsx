import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}

interface ContatoPremiumProps {
  perfil: {
    slug: string;
    whatsapp?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    site?: string | null;
    tema_cor_primaria?: string | null;
    tema_cor_secundaria?: string | null;
  };
  perfilId: string;
  // Props opcionais para controle externo do formulário
  formData?: FormData;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const ContatoPremium = ({ 
  perfil, 
  perfilId,
  formData: externalFormData,
  onInputChange,
  onSubmit,
  isSubmitting: externalIsSubmitting
}: ContatoPremiumProps) => {
  // Estado interno como fallback se não receber props externas
  const [internalFormData, setInternalFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  // Usar dados externos se fornecidos, senão usar internos
  const formData = externalFormData || internalFormData;
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const primaryColor = perfil.tema_cor_primaria || '#6366f1';
  const secondaryColor = perfil.tema_cor_secundaria || '#8b5cf6';

  const handleInternalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onInputChange) {
      onInputChange(e);
    } else {
      setInternalFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(e);
    } else {
      // Comportamento interno de fallback
      setInternalIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setInternalFormData({ nome: '', email: '', telefone: '', mensagem: '' });
      setInternalIsSubmitting(false);
    }
  };

  const infoItems = [
    {
      icon: Clock,
      label: 'Horário de Atendimento',
      value: 'Segunda a Sexta, 8h às 20h',
    },
    {
      icon: MessageCircle,
      label: 'Tempo de Resposta',
      value: 'Em até 24 horas úteis',
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${primaryColor} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: secondaryColor }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ 
              backgroundColor: `${primaryColor}15`,
              color: primaryColor 
            }}
          >
            <Mail className="w-4 h-4" />
            Fale Conosco
          </span>
          
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Entre em Contato
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Estou aqui para ajudar. Preencha o formulário e responderei o mais breve possível.
          </p>
          
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Cards */}
            <div className="space-y-4">
              {infoItems.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${primaryColor}15`,
                      }}
                    >
                      <item.icon 
                        className="w-5 h-5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-semibold text-foreground">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            {perfil.whatsapp && (
              <div 
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                }}
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-semibold text-white text-lg mb-2">
                    Prefere WhatsApp?
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Converse diretamente comigo pelo WhatsApp para uma resposta mais rápida.
                  </p>
                  <a
                    href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{ color: primaryColor }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Iniciar Conversa
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Form Column */}
          <div className="lg:col-span-3">
            <form 
              onSubmit={handleSubmit}
              className="p-8 rounded-3xl bg-card border border-border/50 shadow-xl"
            >
              <div className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nome completo
                  </label>
                  <Input
                    type="text"
                    name="nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={handleInternalInputChange}
                    required
                    className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Email e Telefone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInternalInputChange}
                      required
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleInternalInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Sua mensagem
                  </label>
                  <Textarea
                    name="mensagem"
                    placeholder="Como posso ajudar você?"
                    value={formData.mensagem}
                    onChange={handleInternalInputChange}
                    required
                    rows={5}
                    className="rounded-xl border-border/50 focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar Mensagem
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao enviar, você concorda com nossa política de privacidade.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContatoPremium;
