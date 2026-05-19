-- Permitir leitura pública de configurações white-label ativas
-- Necessário para que páginas públicas (avaliações, questionários) 
-- possam aplicar as cores da marca do psicólogo
CREATE POLICY "Permitir leitura pública de cores white-label" 
ON configuracoes_whitelabel 
FOR SELECT 
TO public 
USING (ativo = true);