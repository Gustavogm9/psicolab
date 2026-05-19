import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, Users, FileText, Calendar } from "lucide-react";

interface FeatureExplanationProps {
  type: "captacao" | "pesquisas" | "financeiro";
}

export function FeatureExplanation({ type }: FeatureExplanationProps) {
  if (type === "captacao") {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Como funciona a Captação de Leads?</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Crie questionários <strong>públicos</strong> sobre bem-estar, liderança ou produtividade. 
          Compartilhe via QR Code, link ou redes sociais. Cada resposta gera automaticamente um 
          <strong> lead qualificado no CRM</strong> com score e recomendações personalizadas.
          <br/>
          <span className="text-sm text-blue-600 dark:text-blue-300 mt-2 block">
            💡 <strong>Ideal para:</strong> captar novos clientes, eventos, palestras, marketing de conteúdo
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  if (type === "financeiro") {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="flex gap-2 mt-1">
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-green-900 dark:text-green-100">Qual a diferença entre Faturas e Contratos?</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="space-y-2 mt-2">
                <div>
                  <strong className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Faturas:
                  </strong>
                  <span className="text-sm">Cobranças pontuais criadas manualmente. Use para serviços avulsos, projetos específicos ou eventos únicos.</span>
                </div>
                <div>
                  <strong className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Contratos:
                  </strong>
                  <span className="text-sm">Acordos recorrentes que geram faturas automaticamente todo mês. Use para mensalidades, assinaturas ou serviços continuados.</span>
                </div>
              </div>
              <span className="text-sm text-green-600 dark:text-green-300 mt-3 block">
                💡 <strong>Dica:</strong> Configure um contrato e esqueça - o sistema gera as faturas automaticamente!
              </span>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <AlertTitle className="text-purple-900 dark:text-purple-100">Como funcionam as Avaliações Internas?</AlertTitle>
      <AlertDescription className="text-purple-800 dark:text-purple-200">
        Crie avaliações <strong>privadas</strong> para medir clima organizacional, burnout, 
        engagement ou estresse dos colaboradores dos seus clientes. Envie convites por email 
        ou compartilhe via link restrito. Analise resultados por categoria e indivíduo.
        <br/>
        <span className="text-sm text-purple-600 dark:text-purple-300 mt-2 block">
          💡 <strong>Ideal para:</strong> diagnóstico organizacional, acompanhamento de projetos, avaliação de resultados
        </span>
      </AlertDescription>
    </Alert>
  );
}
