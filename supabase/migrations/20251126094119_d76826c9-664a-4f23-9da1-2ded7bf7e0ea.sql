-- Adicionar políticas RLS para admins visualizarem todos os dados durante impersonificação

-- Faturas
CREATE POLICY "Admins podem ver todas as faturas"
ON public.faturas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Clientes
CREATE POLICY "Admins podem ver todos os clientes"
ON public.clientes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Leads CRM
CREATE POLICY "Admins podem ver todos os leads"
ON public.leads_diagnostico FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Eventos
CREATE POLICY "Admins podem ver todos os eventos"
ON public.eventos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Avaliações
CREATE POLICY "Admins podem ver todas as avaliacoes"
ON public.avaliacoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Templates de Avaliações
CREATE POLICY "Admins podem ver todos os templates"
ON public.avaliacoes_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Intervenções
CREATE POLICY "Admins podem ver todas as intervencoes"
ON public.intervencoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Oportunidades
CREATE POLICY "Admins podem ver todas as oportunidades"
ON public.oportunidades FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Contratos Financeiros
CREATE POLICY "Admins podem ver todos os contratos"
ON public.contratos_financeiros FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Questionários Diagnóstico
CREATE POLICY "Admins podem ver todos os questionarios"
ON public.questionarios_diagnostico FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Alertas
CREATE POLICY "Admins podem ver todos os alertas"
ON public.alertas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Credenciais Asaas
CREATE POLICY "Admins podem ver todas as credenciais asaas"
ON public.asaas_credentials FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Logs de Sync Asaas
CREATE TABLE IF NOT EXISTS public.asaas_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT,
  atualizadas INTEGER DEFAULT 0,
  erros INTEGER DEFAULT 0,
  total_faturas INTEGER DEFAULT 0,
  duracao_ms INTEGER DEFAULT 0,
  detalhes JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.asaas_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs asaas"
ON public.asaas_sync_logs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Biblioteca de Intervenções
CREATE POLICY "Admins podem ver toda a biblioteca"
ON public.biblioteca_intervencoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Categorias Customizadas
CREATE POLICY "Admins podem ver todas as categorias"
ON public.categorias_customizadas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Projetos
CREATE POLICY "Admins podem ver todos os projetos"
ON public.projetos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Relatórios ROI
CREATE POLICY "Admins podem ver todos os relatorios roi"
ON public.relatorios_roi FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Perfis Públicos
CREATE POLICY "Admins podem ver todos os perfis publicos"
ON public.perfis_publicos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Tabelas relacionadas (via JOIN)

-- Contatos de Clientes
CREATE POLICY "Admins podem ver todos os contatos de clientes"
ON public.clientes_contatos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Interações de Clientes
CREATE POLICY "Admins podem ver todas as interacoes de clientes"
ON public.clientes_interacoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anotações de Leads
CREATE POLICY "Admins podem ver todas as anotacoes de leads"
ON public.leads_anotacoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Contatos de Leads
CREATE POLICY "Admins podem ver todos os contatos de leads"
ON public.leads_contatos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Histórico de Leads
CREATE POLICY "Admins podem ver todo o historico de leads"
ON public.leads_historico FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Participantes de Avaliações
CREATE POLICY "Admins podem ver todos os participantes"
ON public.avaliacoes_participantes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Questões de Avaliações
CREATE POLICY "Admins podem ver todas as questoes de avaliacoes"
ON public.avaliacoes_questoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Respostas Públicas de Avaliações
CREATE POLICY "Admins podem ver todas as respostas publicas"
ON public.avaliacoes_respostas_publicas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Progresso de Intervenções
CREATE POLICY "Admins podem ver todo o progresso de intervencoes"
ON public.intervencoes_progresso FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Questões de Diagnóstico
CREATE POLICY "Admins podem ver todas as questoes de diagnostico"
ON public.questoes_diagnostico FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Respostas de Diagnóstico
CREATE POLICY "Admins podem ver todas as respostas de diagnostico"
ON public.respostas_diagnostico FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Serviços Públicos
CREATE POLICY "Admins podem ver todos os servicos publicos"
ON public.servicos_publicos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Portfolio de Imagens
CREATE POLICY "Admins podem ver todas as imagens de portfolio"
ON public.portfolio_imagens FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Depoimentos Públicos
CREATE POLICY "Admins podem ver todos os depoimentos"
ON public.depoimentos_publicos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Leads de Perfil Público
CREATE POLICY "Admins podem ver todos os leads de perfil publico"
ON public.perfil_publico_leads FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Analytics de Perfil Público
CREATE POLICY "Admins podem ver todos os analytics"
ON public.perfil_publico_analytics FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));