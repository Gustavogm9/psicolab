-- Remover o check constraint antigo
ALTER TABLE categorias_customizadas 
DROP CONSTRAINT IF EXISTS categorias_customizadas_tipo_check;

-- Adicionar novo check constraint incluindo 'evento'
ALTER TABLE categorias_customizadas 
ADD CONSTRAINT categorias_customizadas_tipo_check 
CHECK (tipo IN ('questionario', 'avaliacao', 'intervencao', 'evento'));

-- Inserir categorias padrão de sistema para eventos
INSERT INTO categorias_customizadas (nome, tipo, cor, icone, ordem, consultora_id) VALUES
  ('Follow-up', 'evento', '#3b82f6', 'Phone', 0, NULL),
  ('Reunião', 'evento', '#6366f1', 'Users', 1, NULL),
  ('Workshop', 'evento', '#8b5cf6', 'Presentation', 2, NULL),
  ('Consultoria', 'evento', '#10b981', 'Briefcase', 3, NULL),
  ('Avaliação', 'evento', '#f59e0b', 'ClipboardCheck', 4, NULL),
  ('Apresentação', 'evento', '#ec4899', 'Monitor', 5, NULL),
  ('Treinamento', 'evento', '#14b8a6', 'GraduationCap', 6, NULL)
ON CONFLICT DO NOTHING;