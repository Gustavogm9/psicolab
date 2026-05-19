-- 1. Adicionar constraint UNIQUE para prevenir duplicação de leads
ALTER TABLE leads_diagnostico 
ADD CONSTRAINT unique_resposta_lead 
UNIQUE (resposta_id);

-- 2. Criar função para auto-criar lead quando diagnóstico é concluído
CREATE OR REPLACE FUNCTION auto_criar_lead_diagnostico()
RETURNS TRIGGER AS $$
DECLARE
  questionario_data record;
BEGIN
  -- Buscar dados do questionário
  SELECT titulo, slug, consultora_id 
  INTO questionario_data
  FROM questionarios_diagnostico 
  WHERE id = NEW.questionario_id;
  
  -- Criar lead automaticamente
  INSERT INTO leads_diagnostico (
    resposta_id,
    consultora_id,
    nome,
    email,
    telefone,
    score,
    categoria,
    origem,
    status_crm
  ) VALUES (
    NEW.id,
    questionario_data.consultora_id,
    NEW.nome,
    NEW.email,
    NEW.telefone,
    NEW.score_total,
    NEW.categoria,
    'diagnostico',
    'novo'
  )
  ON CONFLICT (resposta_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Criar trigger que dispara apenas quando status muda para 'concluida'
CREATE TRIGGER trigger_auto_criar_lead
AFTER UPDATE OF status ON respostas_diagnostico
FOR EACH ROW
WHEN (NEW.status = 'concluida' AND OLD.status IS DISTINCT FROM 'concluida')
EXECUTE FUNCTION auto_criar_lead_diagnostico();