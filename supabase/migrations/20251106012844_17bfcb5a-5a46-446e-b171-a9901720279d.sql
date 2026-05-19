-- Criar tabela de analytics para página pública
CREATE TABLE perfil_publico_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES perfis_publicos(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL, -- visita, clique_whatsapp, clique_servico, clique_linkedin, clique_instagram, envio_formulario
  origem TEXT, -- utm_source, utm_medium, utm_campaign, etc
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de leads capturados via página pública
CREATE TABLE perfil_publico_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES perfis_publicos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  origem TEXT NOT NULL DEFAULT 'formulario_contato', -- formulario_contato, diagnostico, widget_servico
  questionario_id UUID REFERENCES questionarios_diagnostico(id),
  resposta_id UUID REFERENCES respostas_diagnostico(id),
  status TEXT NOT NULL DEFAULT 'novo', -- novo, contatado, convertido, perdido
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar campo perfil_publico_id em questionarios_diagnostico
ALTER TABLE questionarios_diagnostico
ADD COLUMN perfil_publico_id UUID REFERENCES perfis_publicos(id);

-- Índices para performance
CREATE INDEX idx_perfil_publico_analytics_perfil ON perfil_publico_analytics(perfil_publico_id);
CREATE INDEX idx_perfil_publico_analytics_created ON perfil_publico_analytics(created_at);
CREATE INDEX idx_perfil_publico_leads_perfil ON perfil_publico_leads(perfil_publico_id);
CREATE INDEX idx_perfil_publico_leads_status ON perfil_publico_leads(status);
CREATE INDEX idx_perfil_publico_leads_created ON perfil_publico_leads(created_at);
CREATE INDEX idx_questionarios_diagnostico_perfil_publico ON questionarios_diagnostico(perfil_publico_id);

-- RLS Policies para perfil_publico_analytics
ALTER TABLE perfil_publico_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode inserir analytics"
  ON perfil_publico_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Donos podem ver analytics de seu perfil"
  ON perfil_publico_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfis_publicos
      WHERE perfis_publicos.id = perfil_publico_analytics.perfil_publico_id
      AND perfis_publicos.user_id = auth.uid()
    )
  );

-- RLS Policies para perfil_publico_leads
ALTER TABLE perfil_publico_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode inserir leads"
  ON perfil_publico_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Donos podem gerenciar leads de seu perfil"
  ON perfil_publico_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfis_publicos
      WHERE perfis_publicos.id = perfil_publico_leads.perfil_publico_id
      AND perfis_publicos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfis_publicos
      WHERE perfis_publicos.id = perfil_publico_leads.perfil_publico_id
      AND perfis_publicos.user_id = auth.uid()
    )
  );

-- Trigger para notificar sobre novos leads
CREATE OR REPLACE FUNCTION notificar_novo_lead_perfil_publico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO alertas (
    consultora_id,
    tipo,
    titulo,
    descricao
  )
  SELECT 
    pp.user_id,
    'lead_perfil_publico',
    '🎯 Novo Lead Capturado!',
    NEW.nome || ' entrou em contato via ' || 
    CASE NEW.origem
      WHEN 'formulario_contato' THEN 'formulário de contato'
      WHEN 'diagnostico' THEN 'diagnóstico'
      WHEN 'widget_servico' THEN 'widget de serviço'
      ELSE NEW.origem
    END
  FROM perfis_publicos pp
  WHERE pp.id = NEW.perfil_publico_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_novo_lead_perfil_publico
  AFTER INSERT ON perfil_publico_leads
  FOR EACH ROW
  EXECUTE FUNCTION notificar_novo_lead_perfil_publico();