-- Atualizar cores das categorias do sistema para melhor contraste
UPDATE categorias_customizadas 
SET cor = CASE nome
  -- Questionários
  WHEN 'Clima Organizacional' THEN '#9b87f5'
  WHEN 'Liderança' THEN '#7E69AB'
  WHEN 'Satisfação' THEN '#22c55e'
  WHEN 'Engajamento' THEN '#f97316'
  WHEN 'Desempenho' THEN '#3b82f6'
  WHEN 'Desenvolvimento' THEN '#ec4899'
  WHEN 'Inscrição' THEN '#8b5cf6'
  -- Avaliações
  WHEN 'Avaliação 360' THEN '#9b87f5'
  WHEN 'Autoavaliação' THEN '#22c55e'
  WHEN 'Avaliação de Equipe' THEN '#3b82f6'
  WHEN 'Feedback' THEN '#f97316'
  -- Intervenções
  WHEN 'Workshop' THEN '#9b87f5'
  WHEN 'Treinamento' THEN '#22c55e'
  WHEN 'Mentoria' THEN '#3b82f6'
  WHEN 'Coaching' THEN '#f97316'
  ELSE cor
END
WHERE consultora_id IS NULL AND ativo = true;