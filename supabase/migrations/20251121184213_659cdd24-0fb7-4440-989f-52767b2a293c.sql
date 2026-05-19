-- Fase 1: Criar estrutura de banco de dados para múltiplos contatos em leads

-- Criar tabela leads_contatos
CREATE TABLE IF NOT EXISTS public.leads_contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads_diagnostico(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  principal BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_contatos_lead_id ON public.leads_contatos(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_contatos_principal ON public.leads_contatos(lead_id, principal) WHERE ativo = true;

-- Habilitar RLS
ALTER TABLE public.leads_contatos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Consultoras gerenciam contatos de seus leads
CREATE POLICY "Consultoras gerenciam contatos de seus leads"
ON public.leads_contatos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.leads_diagnostico
    WHERE leads_diagnostico.id = leads_contatos.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads_diagnostico
    WHERE leads_diagnostico.id = leads_contatos.lead_id
    AND leads_diagnostico.consultora_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_leads_contatos_updated_at
  BEFORE UPDATE ON public.leads_contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 2: Migrar dados existentes (contato principal atual)
INSERT INTO public.leads_contatos (lead_id, nome, cargo, email, telefone, principal)
SELECT 
  id as lead_id,
  nome,
  cargo,
  email,
  telefone,
  true as principal
FROM public.leads_diagnostico
WHERE nome IS NOT NULL AND nome != ''
ON CONFLICT DO NOTHING;