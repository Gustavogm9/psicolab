-- Adicionar campos faltantes na tabela leads_diagnostico
ALTER TABLE leads_diagnostico 
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT,
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
ADD COLUMN IF NOT EXISTS valor_potencial NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proximo_followup TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ultimo_contato TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_prioridade ON leads_diagnostico(prioridade);
CREATE INDEX IF NOT EXISTS idx_leads_status_crm ON leads_diagnostico(status_crm);
CREATE INDEX IF NOT EXISTS idx_leads_proximo_followup ON leads_diagnostico(proximo_followup);

-- Criar tabela para histórico de leads
CREATE TABLE IF NOT EXISTS leads_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads_diagnostico(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de histórico
ALTER TABLE leads_historico ENABLE ROW LEVEL SECURITY;

-- Política para consultoras verem histórico de seus leads
CREATE POLICY "Consultoras veem histórico de seus leads"
ON leads_historico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leads_diagnostico
    WHERE leads_diagnostico.id = leads_historico.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  )
);

-- Política para consultoras inserirem histórico
CREATE POLICY "Consultoras inserem histórico de seus leads"
ON leads_historico FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leads_diagnostico
    WHERE leads_diagnostico.id = leads_historico.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  )
);

-- Criar tabela para anotações de leads
CREATE TABLE IF NOT EXISTS leads_anotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads_diagnostico(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de anotações
ALTER TABLE leads_anotacoes ENABLE ROW LEVEL SECURITY;

-- Política para consultoras verem anotações de seus leads
CREATE POLICY "Consultoras veem anotações de seus leads"
ON leads_anotacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leads_diagnostico
    WHERE leads_diagnostico.id = leads_anotacoes.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  )
);

-- Política para consultoras inserirem anotações
CREATE POLICY "Consultoras inserem anotações em seus leads"
ON leads_anotacoes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leads_diagnostico
    WHERE leads_diagnostico.id = leads_anotacoes.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  ) AND autor_id = auth.uid()
);

-- Política para consultoras atualizarem suas anotações
CREATE POLICY "Consultoras atualizam suas próprias anotações"
ON leads_anotacoes FOR UPDATE
USING (autor_id = auth.uid())
WITH CHECK (autor_id = auth.uid());

-- Política para consultoras deletarem suas anotações
CREATE POLICY "Consultoras deletam suas próprias anotações"
ON leads_anotacoes FOR DELETE
USING (autor_id = auth.uid());

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_leads_historico_lead_id ON leads_historico(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_anotacoes_lead_id ON leads_anotacoes(lead_id);

-- Trigger para registrar mudanças de status automaticamente
CREATE OR REPLACE FUNCTION registrar_mudanca_status_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status_crm IS DISTINCT FROM NEW.status_crm THEN
    INSERT INTO leads_historico (lead_id, tipo, descricao)
    VALUES (
      NEW.id,
      'status_alterado',
      'Status alterado de "' || OLD.status_crm || '" para "' || NEW.status_crm || '"'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_mudanca_status_lead ON leads_diagnostico;
CREATE TRIGGER trigger_mudanca_status_lead
AFTER UPDATE ON leads_diagnostico
FOR EACH ROW
EXECUTE FUNCTION registrar_mudanca_status_lead();