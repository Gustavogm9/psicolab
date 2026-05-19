-- Função para criar evento automaticamente quando intervenção tem data_inicio
CREATE OR REPLACE FUNCTION public.criar_evento_para_intervencao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Criar evento apenas se:
  -- 1. Intervenção tem data_inicio
  -- 2. É um INSERT ou a data_inicio foi alterada
  -- 3. Status não é 'cancelada'
  IF NEW.data_inicio IS NOT NULL 
     AND NEW.status != 'cancelada'
     AND (TG_OP = 'INSERT' OR OLD.data_inicio IS DISTINCT FROM NEW.data_inicio) THEN
    
    -- Verificar se já existe evento para esta intervenção
    IF NOT EXISTS (
      SELECT 1 FROM eventos 
      WHERE tipo = 'intervencao' 
      AND observacoes LIKE '%intervencao_id:' || NEW.id || '%'
    ) THEN
      -- Criar evento na data_inicio às 09:00
      INSERT INTO eventos (
        consultora_id,
        cliente_id,
        titulo,
        tipo,
        data_hora,
        observacoes,
        status
      ) VALUES (
        NEW.consultora_id,
        NEW.cliente_id,
        '🎯 Início: ' || NEW.titulo,
        'intervencao',
        (NEW.data_inicio || ' 09:00:00')::timestamp with time zone,
        'Início da intervenção' || 
        CASE WHEN NEW.descricao IS NOT NULL 
          THEN ': ' || NEW.descricao 
          ELSE '' 
        END ||
        E'\n\n[intervencao_id:' || NEW.id || ']',
        'agendado'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-criar eventos
DROP TRIGGER IF EXISTS trigger_criar_evento_intervencao ON intervencoes;
CREATE TRIGGER trigger_criar_evento_intervencao
  AFTER INSERT OR UPDATE OF data_inicio, status ON intervencoes
  FOR EACH ROW
  EXECUTE FUNCTION criar_evento_para_intervencao();

-- Comentários
COMMENT ON FUNCTION criar_evento_para_intervencao() IS 'Cria automaticamente um evento na agenda quando uma intervenção tem data_inicio definida';
COMMENT ON TRIGGER trigger_criar_evento_intervencao ON intervencoes IS 'Trigger que dispara a criação automática de evento para intervenções';