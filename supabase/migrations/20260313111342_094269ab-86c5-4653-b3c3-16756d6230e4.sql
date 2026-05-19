ALTER TABLE clientes ADD COLUMN asaas_customer_id text;
CREATE INDEX idx_clientes_asaas_customer_id ON clientes(asaas_customer_id);