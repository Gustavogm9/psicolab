-- FASE 1: ESTRUTURA COMPLETA DO SISTEMA DE DIAGNÓSTICOS

-- =====================================================
-- TABELA: questionarios_diagnostico
-- =====================================================
CREATE TABLE questionarios_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Informações básicas
  titulo TEXT NOT NULL,
  descricao TEXT,
  slug TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  
  -- Status e configurações
  ativo BOOLEAN DEFAULT true,
  tempo_estimado INTEGER DEFAULT 5,
  
  -- Configurações avançadas (JSONB)
  configuracoes JSONB DEFAULT '{
    "coletarEmail": true,
    "coletarTelefone": true,
    "coletarNome": true,
    "redirecionarAposResposta": "",
    "mensagemAgradecimento": "Obrigado por responder!"
  }'::jsonb,
  
  -- Estatísticas
  total_questoes INTEGER DEFAULT 0,
  total_respostas INTEGER DEFAULT 0,
  leads_gerados INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT questionarios_diagnostico_categoria_check 
    CHECK (categoria IN ('bem-estar', 'lideranca', 'produtividade', 'clima'))
);

-- Índices para performance
CREATE INDEX idx_questionarios_consultora ON questionarios_diagnostico(consultora_id);
CREATE INDEX idx_questionarios_cliente ON questionarios_diagnostico(cliente_id);
CREATE INDEX idx_questionarios_slug ON questionarios_diagnostico(slug);
CREATE INDEX idx_questionarios_ativo ON questionarios_diagnostico(ativo);

-- RLS
ALTER TABLE questionarios_diagnostico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam seus questionários"
  ON questionarios_diagnostico
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- =====================================================
-- TABELA: questoes_diagnostico
-- =====================================================
CREATE TABLE questoes_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id UUID NOT NULL REFERENCES questionarios_diagnostico(id) ON DELETE CASCADE,
  
  -- Conteúdo da questão
  texto TEXT NOT NULL,
  tipo questao_tipo NOT NULL,
  ordem INTEGER NOT NULL,
  
  -- Configurações
  opcoes JSONB,
  obrigatoria BOOLEAN DEFAULT true,
  peso INTEGER DEFAULT 1 CHECK (peso >= 1 AND peso <= 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir ordem única por questionário
  UNIQUE(questionario_id, ordem)
);

CREATE INDEX idx_questoes_questionario ON questoes_diagnostico(questionario_id);
CREATE INDEX idx_questoes_ordem ON questoes_diagnostico(questionario_id, ordem);

-- RLS
ALTER TABLE questoes_diagnostico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam questões de seus questionários"
  ON questoes_diagnostico
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM questionarios_diagnostico q
      WHERE q.id = questoes_diagnostico.questionario_id
      AND q.consultora_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionarios_diagnostico q
      WHERE q.id = questoes_diagnostico.questionario_id
      AND q.consultora_id = auth.uid()
    )
  );

CREATE POLICY "Público pode ver questões de questionários ativos"
  ON questoes_diagnostico
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionarios_diagnostico q
      WHERE q.id = questoes_diagnostico.questionario_id
      AND q.ativo = true
    )
  );

-- =====================================================
-- TABELA: respostas_diagnostico
-- =====================================================
CREATE TABLE respostas_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id UUID NOT NULL REFERENCES questionarios_diagnostico(id) ON DELETE CASCADE,
  
  -- Dados do respondente
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  
  -- Status da resposta
  status TEXT NOT NULL DEFAULT 'incompleta',
  
  -- Respostas (JSONB)
  respostas JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Análise e scoring
  score_total INTEGER DEFAULT 0,
  categoria TEXT,
  analise_completa JSONB,
  
  -- Timestamps
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_fim TIMESTAMPTZ,
  tempo_resposta INTEGER,
  
  -- Para tracking
  ip_address TEXT,
  user_agent TEXT,
  origem TEXT,
  
  -- Constraints
  CONSTRAINT respostas_diagnostico_status_check 
    CHECK (status IN ('incompleta', 'concluida', 'abandonada'))
);

CREATE INDEX idx_respostas_questionario ON respostas_diagnostico(questionario_id);
CREATE INDEX idx_respostas_email ON respostas_diagnostico(email);
CREATE INDEX idx_respostas_status ON respostas_diagnostico(status);
CREATE INDEX idx_respostas_data ON respostas_diagnostico(data_fim);

-- RLS
ALTER TABLE respostas_diagnostico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode inserir respostas"
  ON respostas_diagnostico
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar suas próprias respostas incompletas"
  ON respostas_diagnostico
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Consultoras veem respostas de seus questionários"
  ON respostas_diagnostico
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionarios_diagnostico q
      WHERE q.id = respostas_diagnostico.questionario_id
      AND q.consultora_id = auth.uid()
    )
  );

-- =====================================================
-- TABELA: leads_diagnostico
-- =====================================================
CREATE TABLE leads_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resposta_id UUID NOT NULL REFERENCES respostas_diagnostico(id) ON DELETE CASCADE,
  
  -- Dados do lead
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  
  -- Qualificação
  score INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  origem TEXT NOT NULL,
  
  -- Status no CRM
  status_crm TEXT DEFAULT 'novo',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contatado_em TIMESTAMPTZ,
  
  UNIQUE(resposta_id),
  
  -- Constraints
  CONSTRAINT leads_diagnostico_status_check 
    CHECK (status_crm IN ('novo', 'contatado', 'qualificado', 'convertido', 'perdido'))
);

CREATE INDEX idx_leads_consultora ON leads_diagnostico(consultora_id);
CREATE INDEX idx_leads_status ON leads_diagnostico(status_crm);
CREATE INDEX idx_leads_score ON leads_diagnostico(score);

-- RLS
ALTER TABLE leads_diagnostico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam seus leads"
  ON leads_diagnostico
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- =====================================================
-- TABELA: relatorios_roi
-- =====================================================
CREATE TABLE relatorios_roi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  questionario_id UUID NOT NULL REFERENCES questionarios_diagnostico(id) ON DELETE CASCADE,
  
  -- Período do relatório
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  -- Métricas
  total_respostas INTEGER DEFAULT 0,
  leads_gerados INTEGER DEFAULT 0,
  taxa_conversao DECIMAL(5,2) DEFAULT 0,
  
  -- ROI Calculado
  investimento DECIMAL(10,2),
  retorno_estimado DECIMAL(10,2),
  roi_percentual DECIMAL(5,2),
  
  -- Dados detalhados (JSONB)
  metricas_detalhadas JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_relatorios_consultora ON relatorios_roi(consultora_id);
CREATE INDEX idx_relatorios_questionario ON relatorios_roi(questionario_id);
CREATE INDEX idx_relatorios_periodo ON relatorios_roi(data_inicio, data_fim);

-- RLS
ALTER TABLE relatorios_roi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam seus relatórios"
  ON relatorios_roi
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_questionarios_diagnostico_updated_at
  BEFORE UPDATE ON questionarios_diagnostico
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar total de questões
CREATE OR REPLACE FUNCTION atualizar_total_questoes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questionarios_diagnostico
  SET total_questoes = (
    SELECT COUNT(*) FROM questoes_diagnostico
    WHERE questionario_id = COALESCE(NEW.questionario_id, OLD.questionario_id)
  )
  WHERE id = COALESCE(NEW.questionario_id, OLD.questionario_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_atualizar_total_questoes
  AFTER INSERT OR DELETE ON questoes_diagnostico
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_total_questoes();

-- Função para atualizar total de respostas
CREATE OR REPLACE FUNCTION atualizar_total_respostas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluida' AND (OLD IS NULL OR OLD.status != 'concluida') THEN
    UPDATE questionarios_diagnostico
    SET total_respostas = total_respostas + 1
    WHERE id = NEW.questionario_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_atualizar_total_respostas
  AFTER INSERT OR UPDATE ON respostas_diagnostico
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_total_respostas();

-- Função para atualizar contador de leads gerados
CREATE OR REPLACE FUNCTION atualizar_leads_gerados()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_atualizar_leads_gerados
  AFTER INSERT ON leads_diagnostico
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_leads_gerados();