-- Criar função SECURITY DEFINER para verificar se avaliação permite resposta pública
-- Isso bypassa as RLS da tabela avaliacoes, permitindo que usuários autenticados também respondam
CREATE OR REPLACE FUNCTION public.avaliacao_permite_resposta_publica(p_avaliacao_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE id = p_avaliacao_id
    AND status = 'ativa'
    AND tipo_acesso = 'publico'
  )
$$;

-- Atualizar a política de INSERT para usar a nova função
DROP POLICY IF EXISTS "Permitir inserts publicos em avaliacoes ativas" ON avaliacoes_respostas_publicas;

CREATE POLICY "Permitir inserts publicos em avaliacoes ativas"
ON avaliacoes_respostas_publicas
FOR INSERT
WITH CHECK (
  public.avaliacao_permite_resposta_publica(avaliacao_id)
);