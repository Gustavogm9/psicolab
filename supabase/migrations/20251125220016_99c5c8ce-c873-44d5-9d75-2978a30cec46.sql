-- Fase 1: Estrutura de Banco de Dados para Impersonificação

-- Criar tabela de logs de impersonificação
CREATE TABLE IF NOT EXISTS admin_impersonation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) NOT NULL,
  action_type text NOT NULL, -- 'start', 'end', 'action'
  action_details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Índices para consultas otimizadas
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON admin_impersonation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_target ON admin_impersonation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_date ON admin_impersonation_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE admin_impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs
CREATE POLICY "Admins can view impersonation logs"
ON admin_impersonation_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Política: Apenas admins podem inserir logs
CREATE POLICY "Admins can insert impersonation logs"
ON admin_impersonation_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Criar função de validação de impersonificação
CREATE OR REPLACE FUNCTION public.can_impersonate(admin_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.has_role(admin_user_id, 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Não pode impersonar outro admin
  IF public.has_role(target_user_id, 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Verificar se target existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;