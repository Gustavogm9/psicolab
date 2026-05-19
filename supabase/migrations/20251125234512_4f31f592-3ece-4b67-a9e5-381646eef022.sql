-- Criar função para retornar usuários com dados completos para impersonificação
CREATE OR REPLACE FUNCTION public.get_users_for_impersonation()
RETURNS TABLE (
  id uuid,
  name text,
  company text,
  avatar_url text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role app_role
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.company,
    p.avatar_url,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    ur.role
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = p.id AND ur2.role = 'admin'
  )
  ORDER BY p.name;
$$;