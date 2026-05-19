-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT,
  colaboradores INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ativo',
  contrato_inicio DATE,
  responsavel TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  risco_atual INTEGER DEFAULT 0,
  ultima_avaliacao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras podem gerenciar seus clientes"
ON public.clientes
FOR ALL
TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Tabela de projetos
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT,
  status TEXT DEFAULT 'Coleta',
  progresso INTEGER DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  prioridade TEXT DEFAULT 'medium',
  participantes_total INTEGER DEFAULT 0,
  participantes_responderam INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras podem gerenciar seus projetos"
ON public.projetos
FOR ALL
TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Tabela de eventos
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo TEXT,
  data_hora TIMESTAMPTZ NOT NULL,
  local TEXT,
  status TEXT DEFAULT 'agendado',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras podem gerenciar seus eventos"
ON public.eventos
FOR ALL
TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Tabela de alertas
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras podem gerenciar seus alertas"
ON public.alertas
FOR ALL
TO authenticated
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
  BEFORE UPDATE ON public.projetos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();