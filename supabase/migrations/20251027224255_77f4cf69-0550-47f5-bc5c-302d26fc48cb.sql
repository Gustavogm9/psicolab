-- Remover coluna status_crm da tabela leads_diagnostico
-- Leads não terão mais status, apenas suas oportunidades terão

ALTER TABLE leads_diagnostico DROP COLUMN IF EXISTS status_crm;

-- Criar oportunidades padrão para leads existentes que não têm oportunidades
INSERT INTO oportunidades (
  consultora_id,
  lead_id,
  titulo,
  estagio,
  probabilidade,
  valor_estimado,
  origem
)
SELECT 
  l.consultora_id,
  l.id,
  'Negócio com ' || l.nome,
  'prospecção',
  CASE 
    WHEN l.score >= 80 THEN 70
    WHEN l.score >= 60 THEN 50
    ELSE 30
  END,
  COALESCE(l.valor_potencial, 0),
  l.origem
FROM leads_diagnostico l
WHERE NOT EXISTS (
  SELECT 1 FROM oportunidades o WHERE o.lead_id = l.id
);

COMMENT ON TABLE oportunidades IS 'Oportunidades de negócio vinculadas a leads ou clientes. Um lead pode ter múltiplas oportunidades simultâneas.';
COMMENT ON COLUMN oportunidades.estagio IS 'Estágio no pipeline de vendas: prospecção, qualificação, proposta, negociação, fechamento, ganho, perdido';