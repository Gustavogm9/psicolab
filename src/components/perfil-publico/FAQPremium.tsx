import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  pergunta: string;
  resposta: string;
}

interface FAQPremiumProps {
  faqs: FAQItem[];
  corPrimaria?: string;
  corSecundaria?: string;
}

export const FAQPremium = ({ faqs, corPrimaria, corSecundaria }: FAQPremiumProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const primaryColor = corPrimaria || '#6366f1';
  const secondaryColor = corSecundaria || '#8b5cf6';

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ 
              backgroundColor: `${primaryColor}15`,
              color: primaryColor 
            }}
          >
            <HelpCircle className="w-4 h-4" />
            Tire suas dúvidas
          </span>
          
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
          />
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className="group rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: isOpen ? `${primaryColor}08` : 'hsl(var(--card))',
                  border: `1px solid ${isOpen ? primaryColor + '40' : 'hsl(var(--border))'}`,
                  boxShadow: isOpen ? `0 8px 30px ${primaryColor}15` : 'none'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Number Badge */}
                    <span 
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300"
                      style={{
                        backgroundColor: isOpen ? primaryColor : `${primaryColor}15`,
                        color: isOpen ? 'white' : primaryColor
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    
                    <h3 className="font-semibold text-foreground text-lg pr-4">
                      {faq.pergunta}
                    </h3>
                  </div>
                  
                  {/* Toggle Icon */}
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? primaryColor : `${primaryColor}15`,
                    }}
                  >
                    <ChevronDown 
                      className="w-5 h-5 transition-transform duration-300"
                      style={{ 
                        color: isOpen ? 'white' : primaryColor,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </div>
                </button>
                
                {/* Answer */}
                <div 
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {faq.resposta}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQPremium;
