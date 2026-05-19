-- Permitir acesso público aos questionários ativos
CREATE POLICY "Público pode ver questionários ativos"
ON questionarios_diagnostico
FOR SELECT
USING (ativo = true);