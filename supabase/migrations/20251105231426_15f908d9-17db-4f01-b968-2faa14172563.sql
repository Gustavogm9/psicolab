-- Criar tabela de perfis públicos
CREATE TABLE public.perfis_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT false,
  
  -- Informações básicas
  titulo_profissional TEXT,
  biografia TEXT,
  foto_perfil TEXT,
  foto_capa TEXT,
  
  -- Contato
  whatsapp TEXT,
  site TEXT,
  instagram TEXT,
  linkedin TEXT,
  
  -- Tema
  tema_cor_primaria TEXT DEFAULT '#6366f1',
  tema_cor_secundaria TEXT DEFAULT '#8b5cf6',
  tema_fonte TEXT DEFAULT 'Inter',
  
  -- SEO
  seo_titulo TEXT,
  seo_descricao TEXT,
  seo_palavras_chave TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de serviços públicos
CREATE TABLE public.servicos_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES public.perfis_publicos(id) ON DELETE CASCADE,
  
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC,
  duracao INTEGER, -- em minutos
  modalidade TEXT CHECK (modalidade IN ('presencial', 'online', 'hibrido')),
  icone TEXT DEFAULT 'Briefcase',
  ordem INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de depoimentos públicos
CREATE TABLE public.depoimentos_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_publico_id UUID NOT NULL REFERENCES public.perfis_publicos(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  cargo TEXT,
  empresa TEXT,
  texto TEXT NOT NULL,
  foto TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  data DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de membros da equipe
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL, -- ID da organização/consultora que convidou
  
  role TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);

-- Criar tabela de convites de equipe
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  
  organization_id UUID NOT NULL, -- ID da organização que está convidando
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  
  token UUID DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(email, organization_id, status)
);

-- Índices para performance
CREATE INDEX idx_perfis_publicos_slug ON public.perfis_publicos(slug);
CREATE INDEX idx_perfis_publicos_user_id ON public.perfis_publicos(user_id);
CREATE INDEX idx_perfis_publicos_ativo ON public.perfis_publicos(ativo);
CREATE INDEX idx_servicos_publicos_perfil ON public.servicos_publicos(perfil_publico_id);
CREATE INDEX idx_depoimentos_publicos_perfil ON public.depoimentos_publicos(perfil_publico_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_org ON public.team_members(organization_id);
CREATE INDEX idx_team_invites_email ON public.team_invites(email);
CREATE INDEX idx_team_invites_token ON public.team_invites(token);

-- Trigger para updated_at
CREATE TRIGGER update_perfis_publicos_updated_at
  BEFORE UPDATE ON public.perfis_publicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.perfis_publicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_publicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depoimentos_publicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis_publicos
CREATE POLICY "Usuários podem ver perfis públicos ativos"
  ON public.perfis_publicos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Usuários podem gerenciar seu próprio perfil público"
  ON public.perfis_publicos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para servicos_publicos
CREATE POLICY "Qualquer um pode ver serviços de perfis ativos"
  ON public.servicos_publicos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = servicos_publicos.perfil_publico_id 
    AND ativo = true
  ));

CREATE POLICY "Donos podem gerenciar seus serviços"
  ON public.servicos_publicos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = servicos_publicos.perfil_publico_id 
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = servicos_publicos.perfil_publico_id 
    AND user_id = auth.uid()
  ));

-- Políticas para depoimentos_publicos
CREATE POLICY "Qualquer um pode ver depoimentos de perfis ativos"
  ON public.depoimentos_publicos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = depoimentos_publicos.perfil_publico_id 
    AND ativo = true
  ));

CREATE POLICY "Donos podem gerenciar seus depoimentos"
  ON public.depoimentos_publicos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = depoimentos_publicos.perfil_publico_id 
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.perfis_publicos 
    WHERE id = depoimentos_publicos.perfil_publico_id 
    AND user_id = auth.uid()
  ));

-- Políticas para team_members
CREATE POLICY "Membros podem ver outros membros da mesma organização"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Apenas donos da organização podem gerenciar membros"
  ON public.team_members FOR ALL
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Políticas para team_invites
CREATE POLICY "Convidadores podem ver seus convites"
  ON public.team_invites FOR SELECT
  USING (invited_by = auth.uid() OR organization_id = auth.uid());

CREATE POLICY "Apenas donos podem criar/gerenciar convites"
  ON public.team_invites FOR ALL
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Função para gerar slug único para perfil público
CREATE OR REPLACE FUNCTION public.generate_perfil_slug(nome text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(nome, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := substring(base_slug, 1, 50);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM perfis_publicos WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;