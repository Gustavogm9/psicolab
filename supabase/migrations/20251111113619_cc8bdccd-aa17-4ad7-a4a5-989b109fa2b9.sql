-- Criar bucket para imagens de perfil (separado do portfolio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfil-imagens', 'perfil-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket perfil-imagens
CREATE POLICY "Qualquer um pode ver imagens de perfil"
ON storage.objects FOR SELECT
USING (bucket_id = 'perfil-imagens');

CREATE POLICY "Usuários autenticados podem fazer upload de suas imagens"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'perfil-imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar suas próprias imagens"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'perfil-imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar suas próprias imagens"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'perfil-imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar seção portfolio na configuração padrão de perfis existentes que não a possuem
UPDATE perfis_publicos
SET secoes_config = secoes_config || '[{"id": "portfolio", "nome": "Portfólio", "ordem": 7, "visivel": true}]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM jsonb_array_elements(secoes_config) AS secao
  WHERE secao->>'id' = 'portfolio'
);