-- Permitir leitura pública de domínios customizados ativos
-- Isso evita erros de RLS quando usuários anônimos (mobile) tentam verificar domínios
CREATE POLICY "Domínios ativos podem ser lidos publicamente"
ON public.dominios_customizados
FOR SELECT
USING (status = 'ativo');