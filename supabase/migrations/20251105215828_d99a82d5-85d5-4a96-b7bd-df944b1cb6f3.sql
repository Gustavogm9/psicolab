-- Criar bucket para anexos de intervenções
INSERT INTO storage.buckets (id, name, public)
VALUES ('intervencoes-anexos', 'intervencoes-anexos', true);

-- Política: Consultoras podem fazer upload de anexos em suas intervenções
CREATE POLICY "Consultoras podem fazer upload de anexos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'intervencoes-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Qualquer um pode ver anexos públicos
CREATE POLICY "Anexos são públicos para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'intervencoes-anexos');

-- Política: Consultoras podem deletar seus próprios anexos
CREATE POLICY "Consultoras podem deletar seus anexos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'intervencoes-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);