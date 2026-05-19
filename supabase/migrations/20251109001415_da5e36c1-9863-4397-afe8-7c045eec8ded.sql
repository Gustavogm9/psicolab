-- Criar bucket para imagens da galeria
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Criar políticas de storage para o bucket
CREATE POLICY "Donos podem fazer upload de imagens do portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Donos podem atualizar suas imagens do portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Donos podem deletar suas imagens do portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Imagens do portfolio são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Criar tabela para metadados das imagens do portfólio
CREATE TABLE portfolio_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES perfis_publicos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  categoria TEXT,
  ordem INTEGER DEFAULT 0,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_portfolio_imagens_perfil ON portfolio_imagens(perfil_publico_id);
CREATE INDEX idx_portfolio_imagens_ordem ON portfolio_imagens(ordem);

-- Enable RLS
ALTER TABLE portfolio_imagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Donos podem gerenciar imagens do seu portfolio"
ON portfolio_imagens FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM perfis_publicos
    WHERE perfis_publicos.id = portfolio_imagens.perfil_publico_id
    AND perfis_publicos.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis_publicos
    WHERE perfis_publicos.id = portfolio_imagens.perfil_publico_id
    AND perfis_publicos.user_id = auth.uid()
  )
);

CREATE POLICY "Qualquer um pode ver imagens de portfolios ativos"
ON portfolio_imagens FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM perfis_publicos
    WHERE perfis_publicos.id = portfolio_imagens.perfil_publico_id
    AND perfis_publicos.ativo = true
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_portfolio_imagens_updated_at
BEFORE UPDATE ON portfolio_imagens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar seção de portfolio na configuração padrão
UPDATE perfis_publicos
SET secoes_config = jsonb_insert(
  COALESCE(secoes_config, '[]'::jsonb),
  '{999}',
  '{"id": "portfolio", "nome": "Portfólio/Galeria", "ordem": 7, "visivel": true}'::jsonb
)
WHERE secoes_config IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM jsonb_array_elements(secoes_config) elem
  WHERE elem->>'id' = 'portfolio'
);