CREATE OR REPLACE FUNCTION public.atualizar_eventos_passados()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE eventos
  SET status = 'nao_realizado'
  WHERE status = 'agendado'
  AND data_hora < NOW() - INTERVAL '2 hours';
END;
$$;