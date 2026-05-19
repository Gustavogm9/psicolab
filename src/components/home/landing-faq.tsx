import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function LandingFAQ() {
  const faqs = [
    {
      question: "Como funciona a página profissional?",
      answer: "Sua página profissional é totalmente personalizável com suas cores, logo, serviços, depoimentos e formulários de contato. Ela funciona como sua vitrine online para atrair empresas e captar leads automaticamente."
    },
    {
      question: "Posso usar meu próprio domínio?",
      answer: "Sim! Você pode configurar seu próprio domínio personalizado (ex: seunome.com.br) para a página profissional. Fornecemos instruções completas de DNS e o sistema verifica automaticamente a configuração."
    },
    {
      question: "Como funcionam os questionários diagnósticos?",
      answer: "Temos questionários prontos de clima organizacional, estresse e saúde mental, ou você pode criar os seus próprios. Os respondentes acessam por link único, e o sistema gera relatórios automáticos com análises e gráficos."
    },
    {
      question: "O sistema calcula ROI automaticamente?",
      answer: "Sim! Você registra as intervenções realizadas e os resultados obtidos (redução de turnover, absenteísmo, etc). O sistema calcula o ROI automaticamente e gera relatórios profissionais em PDF para apresentar aos clientes."
    },
    {
      question: "Como funciona a integração com cobranças?",
      answer: "Integramos com Asaas para emissão de boletos, PIX e cobranças recorrentes. Você cria contratos com valores mensais e o sistema gera as faturas automaticamente no vencimento. Seus clientes recebem as cobranças por email."
    },
    {
      question: "Posso personalizar os relatórios?",
      answer: "Sim! Os relatórios incluem sua logo, cores da marca e você pode adicionar observações personalizadas. Exportamos em PDF profissional, pronto para enviar aos clientes."
    },
    {
      question: "O sistema é seguro e conforme LGPD?",
      answer: "Absolutamente. Usamos criptografia de ponta a ponta, backups automáticos diários, e toda infraestrutura em servidores certificados. Conformidade total com LGPD e políticas de privacidade."
    },
    {
      question: "Tem teste grátis? Posso cancelar quando quiser?",
      answer: "Sim! Oferecemos teste gratuito sem precisar informar cartão de crédito. Você pode cancelar a qualquer momento sem multas. Seus dados ficam disponíveis por 90 dias após cancelamento."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Perguntas frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre o sistema
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border rounded-lg px-6 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
