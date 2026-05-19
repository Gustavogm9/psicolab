-- Fase 4: White-Label e Monetização

-- Tabela para configurações white-label (por empresa/workspace)
CREATE TABLE IF NOT EXISTS public.configuracoes_whitelabel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#3b82f6',
  cor_secundaria TEXT DEFAULT '#8b5cf6',
  dominio_customizado TEXT UNIQUE,
  dominio_verificado BOOLEAN DEFAULT false,
  template_padrao TEXT DEFAULT 'moderno',
  meta_tags JSONB DEFAULT '{}',
  politica_privacidade TEXT,
  termos_uso TEXT,
  analytics_id TEXT,
  pixel_facebook TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para planos de perfil público
CREATE TABLE IF NOT EXISTS public.perfil_publico_planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  max_servicos INTEGER,
  max_depoimentos INTEGER,
  max_portfolio_imagens INTEGER,
  analytics_avancado BOOLEAN DEFAULT false,
  dominio_customizado BOOLEAN DEFAULT false,
  remover_marca BOOLEAN DEFAULT false,
  suporte_prioritario BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna de plano na tabela perfis_publicos
ALTER TABLE public.perfis_publicos 
ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES public.perfil_publico_planos(id),
ADD COLUMN IF NOT EXISTS plano_expira_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whitelabel_id UUID REFERENCES public.configuracoes_whitelabel(id);

-- Tabela para analytics consolidado (admin)
CREATE TABLE IF NOT EXISTS public.perfil_publico_analytics_consolidado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  total_perfis_ativos INTEGER DEFAULT 0,
  total_visualizacoes INTEGER DEFAULT 0,
  total_cliques_cta INTEGER DEFAULT 0,
  total_leads_capturados INTEGER DEFAULT 0,
  total_diagnosticos_iniciados INTEGER DEFAULT 0,
  taxa_conversao_media DECIMAL(5,2),
  whitelabel_id UUID REFERENCES public.configuracoes_whitelabel(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data, whitelabel_id)
);

-- Enable RLS
ALTER TABLE public.configuracoes_whitelabel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_publico_planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_publico_analytics_consolidado ENABLE ROW LEVEL SECURITY;

-- Policies para configuracoes_whitelabel (apenas admins podem ver/editar)
CREATE POLICY "Admins podem visualizar configurações whitelabel" 
ON public.configuracoes_whitelabel 
FOR SELECT 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admins podem criar configurações whitelabel" 
ON public.configuracoes_whitelabel 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admins podem atualizar configurações whitelabel" 
ON public.configuracoes_whitelabel 
FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Policies para perfil_publico_planos (todos podem ver, apenas admins editam)
CREATE POLICY "Todos podem visualizar planos ativos" 
ON public.perfil_publico_planos 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar planos" 
ON public.perfil_publico_planos 
FOR ALL 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Policies para analytics consolidado (apenas admins)
CREATE POLICY "Admins podem visualizar analytics consolidado" 
ON public.perfil_publico_analytics_consolidado 
FOR SELECT 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Inserir planos padrão
INSERT INTO public.perfil_publico_planos (nome, descricao, preco_mensal, features, max_servicos, max_depoimentos, max_portfolio_imagens, ordem) VALUES
('Básico', 'Ideal para começar sua presença digital', 0, '["Perfil público personalizado", "Até 5 serviços", "Até 10 depoimentos", "Analytics básico", "5 imagens no portfólio"]', 5, 10, 5, 1),
('Profissional', 'Para profissionais que querem destacar-se', 49.90, '["Tudo do plano Básico", "Serviços ilimitados", "Até 50 depoimentos", "Analytics avançado", "20 imagens no portfólio", "Remover marca do sistema"]', NULL, 50, 20, 2),
('Premium', 'Solução completa para sua marca pessoal', 99.90, '["Tudo do plano Profissional", "Depoimentos ilimitados", "Portfolio ilimitado", "Domínio customizado", "Suporte prioritário", "Configurações SEO avançadas"]', NULL, NULL, NULL, 3);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_whitelabel_updated_at
BEFORE UPDATE ON public.configuracoes_whitelabel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function para consolidar analytics diariamente (pode ser chamada por um cron job)
CREATE OR REPLACE FUNCTION public.consolidar_analytics_diario()
RETURNS void AS $$
BEGIN
  INSERT INTO public.perfil_publico_analytics_consolidado (
    data,
    total_perfis_ativos,
    total_visualizacoes,
    total_cliques_cta,
    total_leads_capturados,
    total_diagnosticos_iniciados,
    taxa_conversao_media,
    whitelabel_id
  )
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT pp.id) as total_perfis_ativos,
    COALESCE(SUM(a.visualizacoes), 0) as total_visualizacoes,
    COALESCE(SUM(a.cliques_cta), 0) as total_cliques_cta,
    COUNT(DISTINCT l.id) as total_leads_capturados,
    COUNT(DISTINCT d.id) as total_diagnosticos_iniciados,
    CASE 
      WHEN COALESCE(SUM(a.visualizacoes), 0) > 0 
      THEN (COUNT(DISTINCT l.id)::DECIMAL / NULLIF(SUM(a.visualizacoes), 0) * 100)
      ELSE 0 
    END as taxa_conversao_media,
    pp.whitelabel_id
  FROM public.perfis_publicos pp
  LEFT JOIN public.perfil_publico_analytics a ON a.perfil_publico_id = pp.id 
    AND DATE(a.data_evento) = CURRENT_DATE - INTERVAL '1 day'
  LEFT JOIN public.perfil_publico_leads l ON l.perfil_publico_id = pp.id 
    AND DATE(l.created_at) = CURRENT_DATE - INTERVAL '1 day'
  LEFT JOIN public.questionarios d ON d.perfil_publico_id = pp.id 
    AND DATE(d.created_at) = CURRENT_DATE - INTERVAL '1 day'
  WHERE pp.ativo = true
  GROUP BY pp.whitelabel_id
  ON CONFLICT (data, whitelabel_id) DO UPDATE SET
    total_perfis_ativos = EXCLUDED.total_perfis_ativos,
    total_visualizacoes = EXCLUDED.total_visualizacoes,
    total_cliques_cta = EXCLUDED.total_cliques_cta,
    total_leads_capturados = EXCLUDED.total_leads_capturados,
    total_diagnosticos_iniciados = EXCLUDED.total_diagnosticos_iniciados,
    taxa_conversao_media = EXCLUDED.taxa_conversao_media;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;