-- Criar tabela de interações com leads
CREATE TABLE IF NOT EXISTS public.leads_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads_diagnostico(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ligacao', 'reuniao', 'email', 'whatsapp', 'proposta', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_interacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duracao INTEGER, -- em minutos
  resultado TEXT CHECK (resultado IN ('positivo', 'neutro', 'negativo', 'sem_resposta')),
  proximos_passos TEXT,
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de oportunidades
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads_diagnostico(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  consultora_id UUID NOT NULL REFERENCES auth.users(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_estimado NUMERIC(10, 2),
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),
  estagio TEXT NOT NULL DEFAULT 'prospecção' CHECK (estagio IN ('prospecção', 'qualificação', 'proposta', 'negociação', 'fechamento', 'ganho', 'perdido')),
  motivo_perda TEXT,
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  origem TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT lead_ou_cliente CHECK (
    (lead_id IS NOT NULL AND cliente_id IS NULL) OR
    (lead_id IS NULL AND cliente_id IS NOT NULL)
  )
);

-- Criar tabela de interações com clientes
CREATE TABLE IF NOT EXISTS public.clientes_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ligacao', 'reuniao', 'email', 'whatsapp', 'visita', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_interacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duracao INTEGER, -- em minutos
  participantes TEXT[],
  resultado TEXT,
  proximos_passos TEXT,
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_leads_interacoes_lead_id ON public.leads_interacoes(lead_id);
CREATE INDEX idx_leads_interacoes_data ON public.leads_interacoes(data_interacao);
CREATE INDEX idx_oportunidades_lead_id ON public.oportunidades(lead_id);
CREATE INDEX idx_oportunidades_cliente_id ON public.oportunidades(cliente_id);
CREATE INDEX idx_oportunidades_consultora_id ON public.oportunidades(consultora_id);
CREATE INDEX idx_oportunidades_estagio ON public.oportunidades(estagio);
CREATE INDEX idx_clientes_interacoes_cliente_id ON public.clientes_interacoes(cliente_id);
CREATE INDEX idx_clientes_interacoes_data ON public.clientes_interacoes(data_interacao);

-- Habilitar RLS
ALTER TABLE public.leads_interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_interacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leads_interacoes
CREATE POLICY "Consultoras veem interações de seus leads"
  ON public.leads_interacoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads_diagnostico
      WHERE leads_diagnostico.id = leads_interacoes.lead_id
      AND leads_diagnostico.consultora_id = auth.uid()
    )
  );

CREATE POLICY "Consultoras inserem interações em seus leads"
  ON public.leads_interacoes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads_diagnostico
      WHERE leads_diagnostico.id = leads_interacoes.lead_id
      AND leads_diagnostico.consultora_id = auth.uid()
    )
    AND criado_por = auth.uid()
  );

CREATE POLICY "Consultoras atualizam suas próprias interações"
  ON public.leads_interacoes
  FOR UPDATE
  USING (criado_por = auth.uid())
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Consultoras deletam suas próprias interações"
  ON public.leads_interacoes
  FOR DELETE
  USING (criado_por = auth.uid());

-- Políticas RLS para oportunidades
CREATE POLICY "Consultoras gerenciam suas oportunidades"
  ON public.oportunidades
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- Políticas RLS para clientes_interacoes
CREATE POLICY "Consultoras veem interações de seus clientes"
  ON public.clientes_interacoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = clientes_interacoes.cliente_id
      AND clientes.consultora_id = auth.uid()
    )
  );

CREATE POLICY "Consultoras inserem interações em seus clientes"
  ON public.clientes_interacoes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = clientes_interacoes.cliente_id
      AND clientes.consultora_id = auth.uid()
    )
    AND criado_por = auth.uid()
  );

CREATE POLICY "Consultoras atualizam suas próprias interações"
  ON public.clientes_interacoes
  FOR UPDATE
  USING (criado_por = auth.uid())
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Consultoras deletam suas próprias interações"
  ON public.clientes_interacoes
  FOR DELETE
  USING (criado_por = auth.uid());

-- Trigger para atualizar updated_at em oportunidades
CREATE OR REPLACE FUNCTION public.update_oportunidades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_oportunidades_updated_at
  BEFORE UPDATE ON public.oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_oportunidades_updated_at();

-- Trigger para registrar mudanças de estágio em oportunidades
CREATE OR REPLACE FUNCTION public.registrar_mudanca_estagio_oportunidade()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_registrar_mudanca_estagio_oportunidade
  AFTER UPDATE ON public.oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_mudanca_estagio_oportunidade();