-- Tabela principal de domínios customizados
CREATE TABLE public.dominios_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES public.perfis_publicos(id) ON DELETE CASCADE,
  dominio TEXT NOT NULL UNIQUE,
  token_verificacao TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'dns_configurado', 'aguardando_aprovacao', 'ativo', 'erro', 'rejeitado')),
  dns_verificado_em TIMESTAMPTZ,
  ativado_em TIMESTAMPTZ,
  erro_mensagem TEXT,
  notas_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de verificações
CREATE TABLE public.dominios_verificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dominio_id UUID NOT NULL REFERENCES public.dominios_customizados(id) ON DELETE CASCADE,
  tipo_verificacao TEXT NOT NULL,
  sucesso BOOLEAN NOT NULL,
  detalhes JSONB,
  verificado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_dominios_perfil ON public.dominios_customizados(perfil_publico_id);
CREATE INDEX idx_dominios_status ON public.dominios_customizados(status);
CREATE INDEX idx_verificacoes_dominio ON public.dominios_verificacoes(dominio_id);

-- Trigger para updated_at
CREATE TRIGGER update_dominios_updated_at
  BEFORE UPDATE ON public.dominios_customizados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.dominios_customizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dominios_verificacoes ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver e gerenciar domínios de seus próprios perfis
CREATE POLICY "Donos podem gerenciar domínios de seu perfil"
  ON public.dominios_customizados
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis_publicos
      WHERE perfis_publicos.id = dominios_customizados.perfil_publico_id
      AND perfis_publicos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis_publicos
      WHERE perfis_publicos.id = dominios_customizados.perfil_publico_id
      AND perfis_publicos.user_id = auth.uid()
    )
  );

-- Admins podem ver todos os domínios
CREATE POLICY "Admins podem gerenciar todos os domínios"
  ON public.dominios_customizados
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Usuários podem ver verificações de seus domínios
CREATE POLICY "Donos podem ver verificações de seus domínios"
  ON public.dominios_verificacoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dominios_customizados dc
      JOIN public.perfis_publicos pp ON pp.id = dc.perfil_publico_id
      WHERE dc.id = dominios_verificacoes.dominio_id
      AND pp.user_id = auth.uid()
    )
  );

-- Edge functions podem inserir verificações
CREATE POLICY "Edge functions podem inserir verificações"
  ON public.dominios_verificacoes
  FOR INSERT
  WITH CHECK (true);

-- Admins podem ver todas as verificações
CREATE POLICY "Admins podem ver todas as verificações"
  ON public.dominios_verificacoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );