import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, UserCheck, Database, FileText } from "lucide-react";

export default function Privacidade() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm">
              O PsicoLab está comprometido com a proteção da sua privacidade e segurança dos seus dados. 
              Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações 
              pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                1. Dados Coletados
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="font-semibold mb-2">Dados de Cadastro:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo</li>
                <li>E-mail</li>
                <li>Telefone</li>
                <li>CPF (quando aplicável)</li>
                <li>Informações profissionais (CRP, especialização)</li>
              </ul>

              <p className="font-semibold mt-4 mb-2">Dados de Uso:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Endereço IP</li>
                <li>Tipo de navegador</li>
                <li>Páginas acessadas</li>
                <li>Data e hora de acesso</li>
                <li>Ações realizadas no sistema</li>
              </ul>

              <p className="font-semibold mt-4 mb-2">Dados de Clientes e Projetos:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Informações de empresas clientes</li>
                <li>Dados de diagnósticos e questionários</li>
                <li>Respostas de avaliações</li>
                <li>Relatórios e análises</li>
                <li>Documentos e anexos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Finalidade do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Criar e gerenciar sua conta no sistema</li>
                <li>Fornecer acesso às funcionalidades da plataforma</li>
                <li>Processar pagamentos e emitir faturas</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Prevenir fraudes e garantir segurança</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Gerar estatísticas e análises agregadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                3. Base Legal (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>O tratamento de dados pessoais é realizado com base em:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Execução de contrato:</strong> para fornecer os serviços contratados</li>
                <li><strong>Consentimento:</strong> quando você autoriza expressamente</li>
                <li><strong>Legítimo interesse:</strong> para melhorar nossos serviços</li>
                <li><strong>Obrigação legal:</strong> quando exigido por lei</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. Compartilhamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Seus dados podem ser compartilhados apenas com:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Provedores de serviço:</strong> hospedagem, processamento de pagamentos (sob contrato de confidencialidade)</li>
                <li><strong>Autoridades competentes:</strong> quando exigido por lei</li>
                <li><strong>Empresas clientes:</strong> apenas os dados inseridos por você sobre elas (com seu controle total)</li>
              </ul>
              <p className="mt-4 font-semibold">
                NÃO vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                5. Armazenamento e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Implementamos medidas de segurança técnicas e organizacionais:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Criptografia de dados em trânsito (SSL/TLS)</li>
                <li>Criptografia de dados em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Backup regular de dados</li>
                <li>Monitoramento de segurança 24/7</li>
                <li>Servidores em data centers certificados</li>
              </ul>
              <p className="mt-4">
                Seus dados são armazenados em servidores seguros localizados no Brasil e/ou países 
                com nível adequado de proteção de dados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                6. Seus Direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                <li><strong>Correção:</strong> atualizar dados incompletos ou incorretos</li>
                <li><strong>Anonimização ou exclusão:</strong> solicitar remoção de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong>Informação sobre compartilhamento:</strong> saber com quem compartilhamos</li>
                <li><strong>Revogação de consentimento:</strong> retirar autorização a qualquer momento</li>
                <li><strong>Oposição:</strong> se opor ao tratamento em certas circunstâncias</li>
              </ul>
              <p className="mt-4">
                Para exercer seus direitos, entre em contato através do e-mail:{" "}
                <a href="mailto:privacidade@psicolab.com" className="text-primary hover:underline">
                  privacidade@psicolab.com
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                7. Retenção de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades 
                descritas nesta política, salvo quando:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Houver obrigação legal de retenção por prazo maior</li>
                <li>Forem necessários para exercício de direitos em processos</li>
                <li>Você solicitar expressamente a manutenção</li>
              </ul>
              <p className="mt-4">
                Após o cancelamento da conta, dados pessoais são excluídos em até 30 dias, 
                exceto informações necessárias para cumprimento de obrigações legais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies e Tecnologias Similares</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Utilizamos cookies essenciais para o funcionamento do sistema (autenticação, preferências). 
                Cookies analíticos podem ser utilizados para melhorar a experiência, sempre respeitando 
                sua privacidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Transferência Internacional</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Caso seja necessário transferir dados para outros países, garantimos que:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>O país de destino oferece nível adequado de proteção</li>
                <li>Existem cláusulas contratuais de proteção</li>
                <li>Você será informado previamente</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Podemos atualizar esta política periodicamente. Alterações significativas serão 
                comunicadas por e-mail ou notificação no sistema. Recomendamos revisar esta página 
                regularmente.
              </p>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Encarregado de Dados (DPO)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Para questões relacionadas à proteção de dados pessoais:
              </p>
              <ul className="text-sm space-y-2">
                <li><strong>E-mail:</strong> privacidade@psicolab.com</li>
                <li><strong>Telefone:</strong> (11) 9999-9999</li>
                <li><strong>Endereço:</strong> [Endereço completo da empresa]</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
