-- Criar tabela de categorias customizadas
CREATE TABLE public.categorias_customizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultora_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('questionario', 'avaliacao', 'intervencao')),
  cor TEXT DEFAULT '#6366f1',
  icone TEXT DEFAULT 'Tag',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consultora_id, nome, tipo)
);

-- Index para performance
CREATE INDEX idx_categorias_consultora ON public.categorias_customizadas(consultora_id);
CREATE INDEX idx_categorias_tipo ON public.categorias_customizadas(tipo);

-- Enable RLS
ALTER TABLE public.categorias_customizadas ENABLE ROW LEVEL SECURITY;

-- Policy para consultoras gerenciarem suas categorias
CREATE POLICY "Consultoras gerenciam suas categorias"
  ON public.categorias_customizadas
  FOR ALL
  USING (consultora_id = auth.uid())
  WITH CHECK (consultora_id = auth.uid());

-- Policy para ver categorias do sistema (consultora_id NULL)
CREATE POLICY "Categorias do sistema são públicas"
  ON public.categorias_customizadas
  FOR SELECT
  USING (consultora_id IS NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias_customizadas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão do sistema para Questionários
INSERT INTO public.categorias_customizadas (consultora_id, nome, tipo, cor, icone, ordem) VALUES
  (NULL, 'Clima Organizacional', 'questionario', '#6366f1', 'Users', 1),
  (NULL, 'Liderança', 'questionario', '#8b5cf6', 'Crown', 2),
  (NULL, 'Satisfação', 'questionario', '#10b981', 'Smile', 3),
  (NULL, 'Engajamento', 'questionario', '#f59e0b', 'Zap', 4),
  (NULL, 'Desempenho', 'questionario', '#3b82f6', 'TrendingUp', 5),
  (NULL, 'Desenvolvimento', 'questionario', '#ec4899', 'GraduationCap', 6),
  (NULL, 'Inscrição', 'questionario', '#14b8a6', 'FileText', 7);

-- Inserir categorias padrão do sistema para Avaliações
INSERT INTO public.categorias_customizadas (consultora_id, nome, tipo, cor, icone, ordem) VALUES
  (NULL, 'Clima Organizacional', 'avaliacao', '#6366f1', 'Users', 1),
  (NULL, 'Liderança', 'avaliacao', '#8b5cf6', 'Crown', 2),
  (NULL, 'Desenvolvimento', 'avaliacao', '#ec4899', 'GraduationCap', 3),
  (NULL, 'Competências', 'avaliacao', '#10b981', 'Award', 4),
  (NULL, 'Desempenho', 'avaliacao', '#3b82f6', 'TrendingUp', 5);

-- Inserir categorias padrão do sistema para Intervenções
INSERT INTO public.categorias_customizadas (consultora_id, nome, tipo, cor, icone, ordem) VALUES
  (NULL, 'Workshop', 'intervencao', '#6366f1', 'Users', 1),
  (NULL, 'Treinamento', 'intervencao', '#8b5cf6', 'BookOpen', 2),
  (NULL, 'Mentoria', 'intervencao', '#10b981', 'UserCheck', 3),
  (NULL, 'Consultoria', 'intervencao', '#f59e0b', 'Briefcase', 4),
  (NULL, 'Coaching', 'intervencao', '#ec4899', 'Target', 5);