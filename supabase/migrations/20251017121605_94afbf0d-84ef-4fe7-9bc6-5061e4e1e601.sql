-- Criar enum para status de avaliações
CREATE TYPE avaliacao_status AS ENUM ('rascunho', 'ativa', 'pausada', 'finalizada');

-- Criar enum para tipos de questões
CREATE TYPE questao_tipo AS ENUM ('multipla_escolha', 'escala', 'texto_livre', 'sim_nao');

-- Tabela principal de avaliações
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  status avaliacao_status NOT NULL DEFAULT 'rascunho',
  data_inicio DATE,
  data_fim DATE,
  participantes_total INTEGER DEFAULT 0,
  participantes_responderam INTEGER DEFAULT 0,
  progresso INTEGER DEFAULT 0,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de questões das avaliações
CREATE TABLE avaliacoes_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  tipo questao_tipo NOT NULL,
  opcoes JSONB,
  obrigatoria BOOLEAN DEFAULT true,
  categoria TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de templates de avaliações
CREATE TABLE avaliacoes_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL,
  questoes JSONB NOT NULL,
  configuracoes JSONB DEFAULT '{}',
  numero_questoes INTEGER DEFAULT 0,
  tempo_estimado INTEGER DEFAULT 0,
  uso_recente INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ultima_utilizacao TIMESTAMPTZ
);

-- Tabela de participantes e respostas
CREATE TABLE avaliacoes_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  token UUID DEFAULT gen_random_uuid(),
  respondido BOOLEAN DEFAULT false,
  data_convite TIMESTAMPTZ DEFAULT NOW(),
  data_resposta TIMESTAMPTZ,
  respostas JSONB,
  UNIQUE(avaliacao_id, email)
);

-- Enable RLS
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_participantes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para avaliacoes
CREATE POLICY "Consultoras podem gerenciar suas avaliacoes"
ON avaliacoes
FOR ALL
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

CREATE POLICY "Gestores podem ver avaliacoes do seu cliente"
ON avaliacoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clientes
    WHERE clientes.id = avaliacoes.cliente_id
    AND clientes.consultora_id = auth.uid()
  )
);

-- RLS Policies para avaliacoes_questoes
CREATE POLICY "Consultoras podem gerenciar questoes de suas avaliacoes"
ON avaliacoes_questoes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_questoes.avaliacao_id
    AND avaliacoes.consultora_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_questoes.avaliacao_id
    AND avaliacoes.consultora_id = auth.uid()
  )
);

-- RLS Policies para avaliacoes_templates
CREATE POLICY "Consultoras podem gerenciar seus templates"
ON avaliacoes_templates
FOR ALL
USING (consultora_id = auth.uid())
WITH CHECK (consultora_id = auth.uid());

-- RLS Policies para avaliacoes_participantes
CREATE POLICY "Consultoras podem gerenciar participantes de suas avaliacoes"
ON avaliacoes_participantes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_participantes.avaliacao_id
    AND avaliacoes.consultora_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_participantes.avaliacao_id
    AND avaliacoes.consultora_id = auth.uid()
  )
);

CREATE POLICY "Participantes podem ver e responder suas proprias avaliacoes"
ON avaliacoes_participantes
FOR SELECT
USING (true);

CREATE POLICY "Participantes podem atualizar suas respostas"
ON avaliacoes_participantes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indices para performance
CREATE INDEX idx_avaliacoes_consultora ON avaliacoes(consultora_id);
CREATE INDEX idx_avaliacoes_cliente ON avaliacoes(cliente_id);
CREATE INDEX idx_avaliacoes_status ON avaliacoes(status);
CREATE INDEX idx_avaliacoes_questoes_avaliacao ON avaliacoes_questoes(avaliacao_id);
CREATE INDEX idx_avaliacoes_templates_consultora ON avaliacoes_templates(consultora_id);
CREATE INDEX idx_avaliacoes_participantes_avaliacao ON avaliacoes_participantes(avaliacao_id);
CREATE INDEX idx_avaliacoes_participantes_token ON avaliacoes_participantes(token);