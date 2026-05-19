-- FASE 3: SISTEMA DE NOTIFICAÇÕES (CORRIGIDO)

-- 1. Trigger para notificar nova resposta de diagnóstico
CREATE OR REPLACE FUNCTION notificar_nova_resposta_diagnostico()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar quando alguém responde um diagnóstico (apenas quando status muda para concluída)
  IF NEW.status = 'concluida' AND (OLD IS NULL OR OLD.status != 'concluida') THEN
    INSERT INTO alertas (
      consultora_id,
      tipo,
      titulo,
      descricao
    )
    SELECT 
      q.consultora_id,
      'lead_diagnostico',
      '🎯 Novo Lead Gerado!',
      NEW.nome || ' respondeu o questionário "' || q.titulo || '" (Score: ' || NEW.score_total || ')'
    FROM questionarios_diagnostico q
    WHERE q.id = NEW.questionario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notificar_resposta_diagnostico
  AFTER INSERT OR UPDATE ON respostas_diagnostico
  FOR EACH ROW
  EXECUTE FUNCTION notificar_nova_resposta_diagnostico();

-- 2. Trigger para notificar resposta de avaliação (participantes)
CREATE OR REPLACE FUNCTION notificar_resposta_avaliacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar quando participante responde (apenas quando respondido muda para true)
  IF NEW.respondido = true AND (OLD IS NULL OR OLD.respondido = false) THEN
    INSERT INTO alertas (
      consultora_id,
      tipo,
      titulo,
      descricao
    )
    SELECT 
      a.consultora_id,
      'resposta_avaliacao',
      '📊 Nova Resposta Recebida!',
      COALESCE(NEW.nome, NEW.email) || ' respondeu a avaliação "' || a.nome || '"'
    FROM avaliacoes a
    WHERE a.id = NEW.avaliacao_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notificar_resposta_participante
  AFTER INSERT OR UPDATE ON avaliacoes_participantes
  FOR EACH ROW
  EXECUTE FUNCTION notificar_resposta_avaliacao();

-- 3. Trigger para notificar resposta pública de avaliação
CREATE OR REPLACE FUNCTION notificar_resposta_publica_avaliacao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO alertas (
    consultora_id,
    tipo,
    titulo,
    descricao
  )
  SELECT 
    a.consultora_id,
    'resposta_avaliacao_publica',
    '📊 Nova Resposta Pública!',
    COALESCE(NEW.nome, NEW.email, 'Alguém') || ' respondeu a avaliação pública "' || a.nome || '"'
  FROM avaliacoes a
  WHERE a.id = NEW.avaliacao_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notificar_resposta_publica
  AFTER INSERT ON avaliacoes_respostas_publicas
  FOR EACH ROW
  EXECUTE FUNCTION notificar_resposta_publica_avaliacao();

-- 4. Adicionar campos de configuração de lembretes automáticos na tabela avaliacoes
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS lembretes_automaticos boolean DEFAULT false;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS frequencia_lembrete integer DEFAULT 3; -- dias entre lembretes

COMMENT ON COLUMN avaliacoes.lembretes_automaticos IS 'Se true, envia lembretes automáticos para participantes que não responderam';
COMMENT ON COLUMN avaliacoes.frequencia_lembrete IS 'Número de dias entre lembretes automáticos';