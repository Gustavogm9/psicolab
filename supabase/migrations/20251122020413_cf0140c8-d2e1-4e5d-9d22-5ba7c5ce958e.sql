-- ============================================
-- MÓDULO FINANCEIRO + INTEGRAÇÃO ASAAS
-- ============================================

-- Tabela de credenciais Asaas (uma por consultora)
CREATE TABLE asaas_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  webhook_token TEXT DEFAULT gen_random_uuid()::text,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consultora_id)
);

-- Tabela de logs de sincronização do Asaas
CREATE TABLE asaas_sync_logs (
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


-- Tabela de contratos financeiros
CREATE TABLE contratos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  asaas_customer_id TEXT,
  valor_mensal DECIMAL(10,2) NOT NULL,
  dia_vencimento INTEGER NOT NULL DEFAULT 10,
  forma_pagamento TEXT NOT NULL DEFAULT 'PIX',
  status TEXT NOT NULL DEFAULT 'ativo',
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de faturas
CREATE TABLE faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES contratos_financeiros(id) ON DELETE SET NULL,
  numero_fatura TEXT UNIQUE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  asaas_payment_id TEXT UNIQUE,
  asaas_invoice_url TEXT,
  asaas_bank_slip_url TEXT,
  asaas_pix_qr_code TEXT,
  asaas_pix_copy_paste TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  forma_pagamento TEXT,
  metodo_pagamento_real TEXT,
  webhook_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10,2) NOT NULL,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT now(),
  forma_pagamento TEXT NOT NULL,
  asaas_payment_id TEXT,
  asaas_transaction_id TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_faturas_consultora ON faturas(consultora_id);
CREATE INDEX idx_faturas_cliente ON faturas(cliente_id);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_faturas_vencimento ON faturas(data_vencimento);
CREATE INDEX idx_faturas_asaas_id ON faturas(asaas_payment_id);
CREATE INDEX idx_contratos_consultora ON contratos_financeiros(consultora_id);
CREATE INDEX idx_contratos_cliente ON contratos_financeiros(cliente_id);
CREATE INDEX idx_pagamentos_fatura ON pagamentos(fatura_id);

-- RLS Policies
ALTER TABLE asaas_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asaas_sync_logs ENABLE ROW LEVEL SECURITY;

-- Consultoras gerenciam suas próprias credenciais
CREATE POLICY "Consultoras gerenciam credenciais Asaas"
ON asaas_credentials FOR ALL TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Consultoras gerenciam seus contratos
CREATE POLICY "Consultoras gerenciam contratos"
ON contratos_financeiros FOR ALL TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Consultoras gerenciam suas faturas
CREATE POLICY "Consultoras gerenciam faturas"
ON faturas FOR ALL TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Consultoras gerenciam pagamentos
CREATE POLICY "Consultoras gerenciam pagamentos"
ON pagamentos FOR ALL TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Trigger para gerar número de fatura automaticamente
CREATE OR REPLACE FUNCTION gerar_numero_fatura()
RETURNS TRIGGER AS $$
DECLARE
  ano_atual TEXT;
  proximo_numero INTEGER;
  numero_formatado TEXT;
BEGIN
  IF NEW.numero_fatura IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(numero_fatura FROM 'FAT-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO proximo_numero
  FROM faturas
  WHERE numero_fatura LIKE 'FAT-' || ano_atual || '-%'
  AND consultora_id = NEW.consultora_id;
  
  numero_formatado := 'FAT-' || ano_atual || '-' || LPAD(proximo_numero::TEXT, 4, '0');
  NEW.numero_fatura := numero_formatado;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_gerar_numero_fatura
BEFORE INSERT ON faturas
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_fatura();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_asaas_credentials_updated_at
BEFORE UPDATE ON asaas_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at
BEFORE UPDATE ON contratos_financeiros
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faturas_updated_at
BEFORE UPDATE ON faturas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar faturas vencidas
CREATE OR REPLACE FUNCTION atualizar_faturas_vencidas()
RETURNS void AS $$
BEGIN
  UPDATE faturas
  SET status = 'atrasado'
  WHERE status = 'pendente'
  AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para calcular métricas financeiras
CREATE OR REPLACE FUNCTION calcular_metricas_financeiras(
  _consultora_id UUID,
  _data_inicio DATE DEFAULT NULL,
  _data_fim DATE DEFAULT NULL
)
RETURNS TABLE (
  receita_total DECIMAL,
  receita_pendente DECIMAL,
  receita_atrasada DECIMAL,
  total_faturas INTEGER,
  faturas_pagas INTEGER,
  faturas_pendentes INTEGER,
  faturas_atrasadas INTEGER,
  ticket_medio DECIMAL,
  taxa_inadimplencia DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN f.status = 'pago' THEN f.valor ELSE 0 END), 0) as receita_total,
    COALESCE(SUM(CASE WHEN f.status = 'pendente' THEN f.valor ELSE 0 END), 0) as receita_pendente,
    COALESCE(SUM(CASE WHEN f.status = 'atrasado' THEN f.valor ELSE 0 END), 0) as receita_atrasada,
    COUNT(*)::INTEGER as total_faturas,
    COUNT(CASE WHEN f.status = 'pago' THEN 1 END)::INTEGER as faturas_pagas,
    COUNT(CASE WHEN f.status = 'pendente' THEN 1 END)::INTEGER as faturas_pendentes,
    COUNT(CASE WHEN f.status = 'atrasado' THEN 1 END)::INTEGER as faturas_atrasadas,
    COALESCE(AVG(CASE WHEN f.status = 'pago' THEN f.valor END), 0) as ticket_medio,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN f.status = 'atrasado' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100)
      ELSE 0 
    END as taxa_inadimplencia
  FROM faturas f
  WHERE f.consultora_id = _consultora_id
  AND (_data_inicio IS NULL OR f.data_emissao >= _data_inicio)
  AND (_data_fim IS NULL OR f.data_emissao <= _data_fim);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;