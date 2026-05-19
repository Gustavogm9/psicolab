-- Trigger para notificar quando um novo depoimento pendente é criado
CREATE OR REPLACE FUNCTION public.notificar_novo_depoimento_pendente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'pendente' THEN
    INSERT INTO alertas (
      consultora_id,
      tipo,
      titulo,
      descricao
    )
    SELECT 
      pp.user_id,
      'depoimento_pendente',
      '💬 Novo Depoimento Recebido!',
      NEW.nome || ' deixou um depoimento que aguarda sua aprovação'
    FROM perfis_publicos pp
    WHERE pp.id = NEW.perfil_publico_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notificar_novo_depoimento ON public.depoimentos_publicos;
CREATE TRIGGER trigger_notificar_novo_depoimento
  AFTER INSERT ON public.depoimentos_publicos
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_novo_depoimento_pendente();