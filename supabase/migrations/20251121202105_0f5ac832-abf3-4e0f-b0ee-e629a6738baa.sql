-- Migrar tipos de eventos antigos para novas categorias

-- Atualizar eventos com tipos hardcoded para usar nomes das novas categorias
UPDATE eventos 
SET tipo = CASE
  WHEN tipo IN ('reuniao', 'reunião') THEN 'Reunião'
  WHEN tipo = 'workshop' THEN 'Workshop'
  WHEN tipo = 'consultoria' THEN 'Consultoria'
  WHEN tipo = 'intervencao' THEN 'Consultoria'
  WHEN tipo = 'treinamento' THEN 'Treinamento'
  WHEN tipo = 'apresentacao' THEN 'Apresentação'
  WHEN tipo = 'avaliacao' THEN 'Avaliação'
  WHEN tipo IN ('outro', 'followup', 'follow-up') THEN 'Follow-up'
  ELSE tipo
END
WHERE tipo IS NOT NULL;