import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Download,
  PlayCircle,
  FileText,
  ExternalLink,
  Star,
  Clock
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      category: "Primeiros Passos",
      questions: [
        {
          question: "Como criar minha primeira avaliação?",
          answer: "Acesse 'Avaliações' no menu, clique em 'Nova Avaliação' e siga o assistente passo a passo. Escolha o tipo de avaliação, defina os participantes e configure as perguntas."
        },
        {
          question: "Quantos colaboradores posso avaliar?",
          answer: "Isso depende do seu plano. O plano Starter permite até 50 colaboradores, o Professional até 200 e o Enterprise é ilimitado."
        },
        {
          question: "Como os colaboradores receberão a avaliação?",
          answer: "Eles receberão um email com um link único e seguro. Também é possível compartilhar via WhatsApp ou gerar QR Code para facilitar o acesso."
        }
      ]
    },
    {
      category: "Relatórios e Análises",
      questions: [
        {
          question: "Como interpretar os resultados das avaliações?",
          answer: "Nossa plataforma oferece insights automáticos baseados em benchmarks de mercado. Scores acima de 75% são considerados bons, entre 50-75% médios e abaixo de 50% requerem atenção."
        },
        {
          question: "Posso exportar os relatórios?",
          answer: "Sim! Você pode exportar em PDF para apresentações ou Excel para análises detalhadas. Acesse a ação 'Exportar' em qualquer relatório."
        },
        {
          question: "Com que frequência devo realizar avaliações?",
          answer: "Recomendamos avaliações trimestrais para clima organizacional e semestrais para burnout. Para pulse surveys, podem ser mensais."
        }
      ]
    },
    {
      category: "Segurança e Privacidade",
      questions: [
        {
          question: "Os dados dos colaboradores estão seguros?",
          answer: "Sim! Utilizamos criptografia de ponta a ponta, servidores no Brasil e somos certificados ISO 27001. Seus dados nunca são compartilhados com terceiros."
        },
        {
          question: "As respostas são anônimas?",
          answer: "Por padrão sim, mas você pode configurar para identificar respondentes se necessário. Sempre informamos claramente aos participantes se a pesquisa é anônima ou não."
        }
      ]
    }
  ];

  const guides = [
    {
      title: "Guia Completo: Primeiros Passos",
      description: "Aprenda a configurar sua conta e criar sua primeira avaliação",
      duration: "15 min",
      type: "Artigo",
      category: "Iniciante",
      popularity: 4.8
    },
    {
      title: "Como Interpretar Resultados de Burnout",
      description: "Entenda os indicadores e como agir com base nos resultados",
      duration: "20 min",
      type: "Artigo",
      category: "Avançado",
      popularity: 4.6
    },
    {
      title: "Vídeo: Criando Intervenções Eficazes",
      description: "Aprenda a criar planos de ação baseados nos resultados",
      duration: "12 min",
      type: "Vídeo",
      category: "Intermediário",
      popularity: 4.9
    },
    {
      title: "Benchmark: Como Sua Empresa se Compara",
      description: "Entenda como usar nossos dados de mercado",
      duration: "8 min",
      type: "Artigo",
      category: "Intermediário",
      popularity: 4.7
    }
  ];

  const videos = [
    {
      title: "Tour Completo da Plataforma",
      duration: "8:45",
      views: "2.1k",
      thumbnail: "🎯"
    },
    {
      title: "Configurando Equipes e Departamentos",
      duration: "5:30",
      views: "1.8k",
      thumbnail: "👥"
    },
    {
      title: "Criando Dashboards Personalizados",
      duration: "12:15",
      views: "956",
      thumbnail: "📊"
    },
    {
      title: "Integração com HRIS",
      duration: "15:20",
      views: "743",
      thumbnail: "🔗"
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas, guias e recursos para aproveitar ao máximo nossa plataforma
          </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar na central de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Documentação</CardTitle>
            <CardDescription>Guias detalhados e tutoriais</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Video className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Vídeos Tutorial</CardTitle>
            <CardDescription>Aprenda assistindo</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Contato Direto</CardTitle>
            <CardDescription>Fale com nosso suporte</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guias</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {filteredFAQ.map((category, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredGuides.map((guide, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{guide.category}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{guide.popularity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted flex items-center justify-center text-6xl">
                    {video.thumbnail}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" />
                        {video.duration}
                      </span>
                      <span>{video.views} visualizações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Downloads Tab */}
        <TabsContent value="downloads" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Guia de Boas Práticas
                </CardTitle>
                <CardDescription>
                  Manual completo com as melhores práticas para pesquisas organizacionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF (2.1 MB)
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Template de Relatório
                </CardTitle>
                <CardDescription>
                  Template PowerPoint para apresentação de resultados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PPTX (3.8 MB)
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Checklist de Implementação
                </CardTitle>
                <CardDescription>
                  Lista de verificação para implementação bem-sucedida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF (890 KB)
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Documentação técnica completa da nossa API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF (1.5 MB)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle>Ainda precisa de ajuda?</CardTitle>
          <CardDescription>
            Nossa equipe de suporte está sempre pronta para ajudar
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat ao Vivo
            </Button>
            <Button variant="outline">
              Enviar Email
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Tempo médio de resposta: 2 horas úteis
          </p>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
};

export default HelpCenter;