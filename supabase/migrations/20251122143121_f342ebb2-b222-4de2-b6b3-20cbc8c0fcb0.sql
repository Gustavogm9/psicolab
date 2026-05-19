-- Adicionar campos necessários para rastreamento completo de pagamentos
ALTER TABLE faturas
ADD COLUMN IF NOT EXISTS tentativas_pagamento INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visualizado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_pagamento_antecipado TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS chargeback_status TEXT,
ADD COLUMN IF NOT EXISTS risco_analise_status TEXT;

COMMENT ON COLUMN faturas.tentativas_pagamento IS 'Contador de tentativas de pagamento recusadas';
COMMENT ON COLUMN faturas.visualizado_em IS 'Data/hora que o cliente visualizou o boleto/fatura';
COMMENT ON COLUMN faturas.data_pagamento_antecipado IS 'Data de antecipação do pagamento';
COMMENT ON COLUMN faturas.chargeback_status IS 'Status do chargeback: solicitado, em_disputa, aguardando_reversao';
COMMENT ON COLUMN faturas.risco_analise_status IS 'Status da análise de risco: aguardando, aprovado, reprovado';