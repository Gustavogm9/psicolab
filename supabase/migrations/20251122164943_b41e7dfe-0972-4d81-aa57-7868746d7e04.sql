-- Função para atribuir automaticamente role admin a emails específicos
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o email é do admin designado, atribuir role admin automaticamente
  IF NEW.email = 'gustavo.macedo@guilds.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin atribuído automaticamente ao usuário %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserção de novos usuários
DROP TRIGGER IF EXISTS on_auth_user_auto_admin ON auth.users;
CREATE TRIGGER on_auth_user_auto_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_role();

-- Tentar atribuir admin se o usuário já existe
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'gustavo.macedo@guilds.com.br';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin atribuído ao usuário existente';
  ELSE
    RAISE NOTICE 'Usuário ainda não cadastrado - será admin automaticamente ao se registrar';
  END IF;
END;
$$;