-- ============================================
-- FASE 1: Adicionar campo de tracking ultima_interacao
-- ============================================

-- Adicionar coluna ultima_interacao à tabela leads_diagnostico
ALTER TABLE leads_diagnostico 
ADD COLUMN IF NOT EXISTS ultima_interacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índice para otimizar queries de filtragem por data
CREATE INDEX IF NOT EXISTS idx_leads_ultima_interacao 
ON leads_diagnostico(ultima_interacao DESC);

-- ============================================
-- FASE 1: Corrigir trigger para tratar duplicate key corretamente
-- ============================================

-- Substituir função do trigger com lógica de UPSERT correta
CREATE OR REPLACE FUNCTION public.auto_criar_lead_diagnostico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  questionario_data record;
  lead_existente_id uuid;
BEGIN
  -- Buscar dados do questionário
  SELECT titulo, slug, consultora_id 
  INTO questionario_data
  FROM questionarios_diagnostico 
  WHERE id = NEW.questionario_id;
  
  -- Verificar se já existe lead com este email para esta consultora
  SELECT id INTO lead_existente_id
  FROM leads_diagnostico
  WHERE email = NEW.email 
    AND consultora_id = questionario_data.consultora_id
  LIMIT 1;
  
  IF lead_existente_id IS NOT NULL THEN
    -- Lead já existe: atualizar com dados mais recentes
    UPDATE leads_diagnostico SET
      nome = NEW.nome,
      telefone = COALESCE(NEW.telefone, telefone),
      score = GREATEST(score, NEW.score_total),
      categoria = NEW.categoria,
      ultima_interacao = NOW()
    WHERE id = lead_existente_id;
  ELSE
    -- Lead não existe: criar novo (com tratamento de conflito por resposta_id)
    INSERT INTO leads_diagnostico (
      resposta_id,
      consultora_id,
      nome,
      email,
      telefone,
      score,
      categoria,
      origem,
      status_crm,
      ultima_interacao
    ) VALUES (
      NEW.id,
      questionario_data.consultora_id,
      NEW.nome,
      NEW.email,
      NEW.telefone,
      NEW.score_total,
      NEW.categoria,
      'diagnostico',
      'novo',
      NOW()
    )
    ON CONFLICT (resposta_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;