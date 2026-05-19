import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermosDeUso() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Ao acessar e usar o PsicoLab, você concorda com estes Termos de Uso e todas as 
                leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, 
                está proibido de usar ou acessar este sistema.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O PsicoLab é uma plataforma de gestão para psicólogos organizacionais que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sistema de CRM para gestão de leads corporativos</li>
                <li>Criação e aplicação de diagnósticos e questionários</li>
                <li>Geração de relatórios e análises de ROI</li>
                <li>Gerenciamento de projetos e intervenções</li>
                <li>Controle financeiro e emissão de faturas</li>
                <li>Perfil público personalizável</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Cadastro e Conta de Usuário</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Para utilizar o sistema, você deve criar uma conta fornecendo informações precisas 
                e completas. Você é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
                <li>Garantir que suas informações de cadastro estejam sempre atualizadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Uso Aceitável</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Você concorda em NÃO:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violar qualquer lei ou regulamento aplicável</li>
                <li>Compartilhar suas credenciais de acesso com terceiros</li>
                <li>Tentar acessar áreas restritas do sistema</li>
                <li>Interferir ou interromper o funcionamento do sistema</li>
                <li>Usar o sistema para fins fraudulentos ou maliciosos</li>
                <li>Copiar, modificar ou distribuir conteúdo do sistema sem autorização</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Todo o conteúdo, recursos e funcionalidades do PsicoLab são de propriedade exclusiva 
                da plataforma e estão protegidos por leis de direitos autorais. Você mantém todos os 
                direitos sobre os dados que insere no sistema (clientes, diagnósticos, relatórios).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Proteção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O tratamento de dados pessoais no PsicoLab está detalhado em nossa{" "}
                <a href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                . Garantimos conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Pagamentos e Reembolsos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O acesso ao sistema pode incluir planos gratuitos e pagos. Pagamentos são processados 
                através de gateway seguro. Cancelamentos podem ser realizados a qualquer momento, 
                mas valores já pagos não são reembolsáveis proporcionalmente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O PsicoLab é fornecido "como está". Não garantimos que o serviço será ininterrupto 
                ou livre de erros. Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Perda de dados devido a falhas técnicas</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Decisões tomadas com base nas análises fornecidas</li>
                <li>Interrupções temporárias para manutenção</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Rescisão</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Podemos suspender ou encerrar seu acesso ao sistema imediatamente, sem aviso prévio, 
                em caso de violação destes termos. Você pode cancelar sua conta a qualquer momento 
                através das configurações do sistema.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Modificações dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                significativas serão comunicadas por e-mail ou através de notificação no sistema. 
                O uso continuado após as alterações constitui aceitação dos novos termos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Lei Aplicável</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida nos tribunais brasileiros competentes.
              </p>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail 
                contato@psicolab.com ou pelo telefone (11) 9999-9999.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
