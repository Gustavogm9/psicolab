-- ============================================
-- CORREÇÃO FINAL: Adicionar search_path em todas as funções
-- ============================================

-- Atualizar todas as funções para terem search_path explícito
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo_acesso = 'publico' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := generate_avaliacao_slug(NEW.nome);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_criar_lead_diagnostico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  questionario_data record;
BEGIN
  SELECT titulo, slug, consultora_id 
  INTO questionario_data
  FROM questionarios_diagnostico 
  WHERE id = NEW.questionario_id;
  
  INSERT INTO leads_diagnostico (
    resposta_id,
    consultora_id,
    nome,
    email,
    telefone,
    score,
    categoria,
    origem,
    status_crm
  ) VALUES (
    NEW.id,
    questionario_data.consultora_id,
    NEW.nome,
    NEW.email,
    NEW.telefone,
    NEW.score_total,
    NEW.categoria,
    'diagnostico',
    'novo'
  )
  ON CONFLICT (resposta_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_oportunidades_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.registrar_mudanca_estagio_oportunidade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.estagio IS DISTINCT FROM NEW.estagio THEN
    INSERT INTO public.leads_historico (lead_id, tipo, descricao)
    SELECT 
      NEW.lead_id,
      'oportunidade_estagio',
      'Oportunidade "' || NEW.titulo || '" mudou de estágio: ' || OLD.estagio || ' → ' || NEW.estagio
    WHERE NEW.lead_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_nova_resposta_diagnostico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.notificar_resposta_avaliacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.notificar_resposta_publica_avaliacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.criar_evento_para_intervencao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.data_inicio IS NOT NULL 
     AND NEW.status != 'cancelada'
     AND (TG_OP = 'INSERT' OR OLD.data_inicio IS DISTINCT FROM NEW.data_inicio) THEN
    
    IF NOT EXISTS (
      SELECT 1 FROM eventos 
      WHERE tipo = 'intervencao' 
      AND observacoes LIKE '%intervencao_id:' || NEW.id || '%'
    ) THEN
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

CREATE OR REPLACE FUNCTION public.consolidar_analytics_diario()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfil_publico_analytics_consolidado (
    data,
    total_perfis_ativos,
    total_visualizacoes,
    total_cliques_cta,
    total_leads_capturados,
    total_diagnosticos_iniciados,
    taxa_conversao_media,
    whitelabel_id
  )
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT pp.id) as total_perfis_ativos,
    COALESCE(SUM(a.visualizacoes), 0) as total_visualizacoes,
    COALESCE(SUM(a.cliques_cta), 0) as total_cliques_cta,
    COUNT(DISTINCT l.id) as total_leads_capturados,
    COUNT(DISTINCT d.id) as total_diagnosticos_iniciados,
    CASE 
      WHEN COALESCE(SUM(a.visualizacoes), 0) > 0 
      THEN (COUNT(DISTINCT l.id)::DECIMAL / NULLIF(SUM(a.visualizacoes), 0) * 100)
      ELSE 0 
    END as taxa_conversao_media,
    pp.whitelabel_id
  FROM public.perfis_publicos pp
  LEFT JOIN public.perfil_publico_analytics a ON a.perfil_publico_id = pp.id 
    AND DATE(a.data_evento) = CURRENT_DATE - INTERVAL '1 day'
  LEFT JOIN public.perfil_publico_leads l ON l.perfil_publico_id = pp.id 
    AND DATE(l.created_at) = CURRENT_DATE - INTERVAL '1 day'
  LEFT JOIN public.questionarios d ON d.perfil_publico_id = pp.id 
    AND DATE(d.created_at) = CURRENT_DATE - INTERVAL '1 day'
  WHERE pp.ativo = true
  GROUP BY pp.whitelabel_id
  ON CONFLICT (data, whitelabel_id) DO UPDATE SET
    total_perfis_ativos = EXCLUDED.total_perfis_ativos,
    total_visualizacoes = EXCLUDED.total_visualizacoes,
    total_cliques_cta = EXCLUDED.total_cliques_cta,
    total_leads_capturados = EXCLUDED.total_leads_capturados,
    total_diagnosticos_iniciados = EXCLUDED.total_diagnosticos_iniciados,
    taxa_conversao_media = EXCLUDED.taxa_conversao_media;
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_novo_lead_perfil_publico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO alertas (
    consultora_id,
    tipo,
    titulo,
    descricao
  )
  SELECT 
    pp.user_id,
    'lead_perfil_publico',
    '🎯 Novo Lead Capturado!',
    NEW.nome || ' entrou em contato via ' || 
    CASE NEW.origem
      WHEN 'formulario_contato' THEN 'formulário de contato'
      WHEN 'diagnostico' THEN 'diagnóstico'
      WHEN 'widget_servico' THEN 'widget de serviço'
      ELSE NEW.origem
    END
  FROM perfis_publicos pp
  WHERE pp.id = NEW.perfil_publico_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_total_respostas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'concluida' AND (OLD IS NULL OR OLD.status != 'concluida') THEN
    UPDATE questionarios_diagnostico
    SET total_respostas = total_respostas + 1
    WHERE id = NEW.questionario_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_leads_gerados()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE questionarios_diagnostico
  SET leads_gerados = (
    SELECT COUNT(*) FROM leads_diagnostico l
    JOIN respostas_diagnostico r ON r.id = l.resposta_id
    WHERE r.questionario_id = (
      SELECT questionario_id FROM respostas_diagnostico WHERE id = NEW.resposta_id
    )
  )
  WHERE id = (
    SELECT questionario_id FROM respostas_diagnostico WHERE id = NEW.resposta_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.registrar_mudanca_status_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status_crm IS DISTINCT FROM NEW.status_crm THEN
    INSERT INTO leads_historico (lead_id, tipo, descricao)
    VALUES (
      NEW.id,
      'status_alterado',
      'Status alterado de "' || OLD.status_crm || '" para "' || NEW.status_crm || '"'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'gestor'::app_role)
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_total_questoes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE questionarios_diagnostico
  SET total_questoes = (
    SELECT COUNT(*) FROM questoes_diagnostico
    WHERE questionario_id = COALESCE(NEW.questionario_id, OLD.questionario_id)
  )
  WHERE id = COALESCE(NEW.questionario_id, OLD.questionario_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;