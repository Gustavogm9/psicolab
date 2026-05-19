-- Adicionar coluna permite_auto_identificacao na tabela avaliacoes
ALTER TABLE public.avaliacoes 
ADD COLUMN IF NOT EXISTS permite_auto_identificacao BOOLEAN DEFAULT false;

-- Criar função security definer para verificar se avaliação permite auto-identificação
CREATE OR REPLACE FUNCTION public.avaliacao_permite_auto_identificacao(p_avaliacao_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE id = p_avaliacao_id
    AND status = 'ativa'
    AND tipo_acesso = 'restrito'
    AND permite_auto_identificacao = true
  )
$$;

-- Criar política RLS para permitir inserts anônimos em avaliacoes_participantes quando auto-identificação está habilitada
CREATE POLICY "Permitir auto-cadastro de participantes"
ON public.avaliacoes_participantes
FOR INSERT
WITH CHECK (
  avaliacao_permite_auto_identificacao(avaliacao_id)
);