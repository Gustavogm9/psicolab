-- Remover constraint UNIQUE global de numero_fatura
ALTER TABLE faturas DROP CONSTRAINT IF EXISTS faturas_numero_fatura_key;

-- Criar índice UNIQUE composto (numero_fatura + consultora_id)
-- Permite que diferentes psicólogos tenham o mesmo número de fatura
CREATE UNIQUE INDEX idx_faturas_numero_consultora 
ON faturas (numero_fatura, consultora_id) 
WHERE numero_fatura IS NOT NULL;

-- Remover constraint UNIQUE global de asaas_payment_id
ALTER TABLE faturas DROP CONSTRAINT IF EXISTS faturas_asaas_payment_id_key;

-- Criar índice UNIQUE composto (asaas_payment_id + consultora_id)
-- Isola os IDs de pagamento Asaas por psicólogo
CREATE UNIQUE INDEX idx_faturas_asaas_consultora 
ON faturas (asaas_payment_id, consultora_id) 
WHERE asaas_payment_id IS NOT NULL;