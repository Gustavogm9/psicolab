-- Tabela principal de intervenções
CREATE TABLE public.intervencoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultora_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planejada',
  prioridade TEXT NOT NULL DEFAULT 'media',
  data_inicio DATE,
  data_fim DATE,
  duracao_estimada INTEGER, -- em dias
  responsavel TEXT,
  participantes TEXT[],
  custo_estimado NUMERIC(10, 2),
  resultados_esperados TEXT,
  resultados_obtidos TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  progresso INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_intervencoes_consultora ON public.intervencoes(consultora_id);
CREATE INDEX idx_intervencoes_cliente ON public.intervencoes(cliente_id);
CREATE INDEX idx_intervencoes_status ON public.intervencoes(status);
CREATE INDEX idx_intervencoes_categoria ON public.intervencoes(categoria);

-- Comentários
COMMENT ON TABLE public.intervencoes IS 'Intervenções organizacionais criadas pelas consultoras';
COMMENT ON COLUMN public.intervencoes.categoria IS 'Nome da categoria (pode ser categoria customizada da tabela categorias_customizadas)';
COMMENT ON COLUMN public.intervencoes.status IS 'Status: planejada, em_andamento, concluida, cancelada';
COMMENT ON COLUMN public.intervencoes.prioridade IS 'Prioridade: baixa, media, alta, critica';

-- RLS
ALTER TABLE public.intervencoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras gerenciam suas intervenções"
  ON public.intervencoes
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_intervencoes_updated_at
  BEFORE UPDATE ON public.intervencoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de biblioteca de ações (intervenções pré-definidas)
CREATE TABLE public.biblioteca_intervencoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultora_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  esforco TEXT NOT NULL DEFAULT 'medio',
  impacto TEXT NOT NULL DEFAULT 'medio',
  duracao_estimada INTEGER,
  custo_estimado NUMERIC(10, 2),
  template BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_biblioteca_intervencoes_consultora ON public.biblioteca_intervencoes(consultora_id);
CREATE INDEX idx_biblioteca_intervencoes_categoria ON public.biblioteca_intervencoes(categoria);

-- Comentários
COMMENT ON TABLE public.biblioteca_intervencoes IS 'Biblioteca de ações/intervenções pré-definidas';
COMMENT ON COLUMN public.biblioteca_intervencoes.consultora_id IS 'NULL para ações do sistema, UUID para ações personalizadas da consultora';
COMMENT ON COLUMN public.biblioteca_intervencoes.esforco IS 'Esforço: baixo, medio, alto';
COMMENT ON COLUMN public.biblioteca_intervencoes.impacto IS 'Impacto: baixo, medio, alto';

-- RLS para biblioteca
ALTER TABLE public.biblioteca_intervencoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ações do sistema são públicas"
  ON public.biblioteca_intervencoes
  FOR SELECT
  USING (consultora_id IS NULL);

CREATE POLICY "Consultoras gerenciam suas ações personalizadas"
  ON public.biblioteca_intervencoes
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- Tabela de progresso/histórico de intervenções
CREATE TABLE public.intervencoes_progresso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intervencao_id UUID NOT NULL REFERENCES public.intervencoes(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'atualizacao',
  descricao TEXT NOT NULL,
  progresso_anterior INTEGER,
  progresso_novo INTEGER,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_intervencoes_progresso_intervencao ON public.intervencoes_progresso(intervencao_id);
CREATE INDEX idx_intervencoes_progresso_autor ON public.intervencoes_progresso(autor_id);

-- Comentários
COMMENT ON TABLE public.intervencoes_progresso IS 'Histórico de progresso e atualizações das intervenções';
COMMENT ON COLUMN public.intervencoes_progresso.tipo IS 'Tipo: atualizacao, comentario, marco, conclusao';

-- RLS para progresso
ALTER TABLE public.intervencoes_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultoras veem progresso de suas intervenções"
  ON public.intervencoes_progresso
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.intervencoes
    WHERE intervencoes.id = intervencoes_progresso.intervencao_id
    AND intervencoes.consultora_id = auth.uid()
  ));

CREATE POLICY "Consultoras inserem progresso em suas intervenções"
  ON public.intervencoes_progresso
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.intervencoes
      WHERE intervencoes.id = intervencoes_progresso.intervencao_id
      AND intervencoes.consultora_id = auth.uid()
    )
    AND autor_id = auth.uid()
  );

-- Inserir algumas ações padrão na biblioteca
INSERT INTO public.biblioteca_intervencoes (consultora_id, titulo, descricao, categoria, esforco, impacto, duracao_estimada, ordem) VALUES
  (NULL, 'Workshop de Comunicação', 'Workshop focado em melhorar a comunicação entre equipes e departamentos', 'Comunicação', 'medio', 'alto', 1, 1),
  (NULL, 'Programa de Reconhecimento', 'Implementar sistema de reconhecimento e recompensa para colaboradores', 'Engajamento', 'baixo', 'alto', 30, 2),
  (NULL, 'Pesquisa de Clima Trimestral', 'Realizar pesquisa de clima organizacional a cada 3 meses', 'Clima Organizacional', 'baixo', 'medio', 7, 3),
  (NULL, 'Reuniões 1:1 Estruturadas', 'Estabelecer rotina de reuniões individuais entre líderes e liderados', 'Liderança', 'medio', 'alto', 60, 4),
  (NULL, 'Programa de Mentoria', 'Criar programa de mentoria interna para desenvolvimento de talentos', 'Desenvolvimento', 'alto', 'alto', 90, 5),
  (NULL, 'Redesign do Espaço de Trabalho', 'Melhorar o ambiente físico de trabalho para aumentar produtividade', 'Ambiente', 'alto', 'medio', 30, 6),
  (NULL, 'Política de Feedback Contínuo', 'Implementar cultura de feedback regular e construtivo', 'Cultura', 'medio', 'alto', 45, 7),
  (NULL, 'Programa de Bem-estar', 'Ações focadas em saúde física e mental dos colaboradores', 'Bem-estar', 'medio', 'alto', 60, 8);