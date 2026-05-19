-- Criar tabela de contatos
CREATE TABLE clientes_contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT NOT NULL,
  telefone TEXT,
  principal BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_clientes_contatos_cliente_id ON clientes_contatos(cliente_id);
CREATE INDEX idx_clientes_contatos_email ON clientes_contatos(email);

-- Trigger para updated_at
CREATE TRIGGER update_clientes_contatos_updated_at
  BEFORE UPDATE ON clientes_contatos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE clientes_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam contatos de seus clientes"
  ON clientes_contatos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = clientes_contatos.cliente_id
      AND clientes.consultora_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = clientes_contatos.cliente_id
      AND clientes.consultora_id = auth.uid()
    )
  );

-- Garantir apenas 1 contato principal por cliente
CREATE UNIQUE INDEX idx_clientes_contatos_principal_unico
  ON clientes_contatos(cliente_id)
  WHERE principal = true;

-- Migrar dados existentes (criar contato principal baseado nos dados atuais)
INSERT INTO clientes_contatos (cliente_id, nome, email, telefone, principal, cargo)
SELECT 
  id,
  COALESCE(responsavel, 'Responsável Principal'),
  COALESCE(email, 'contato@empresa.com'),
  telefone,
  true,
  'Responsável'
FROM clientes
WHERE email IS NOT NULL OR responsavel IS NOT NULL
ON CONFLICT DO NOTHING;