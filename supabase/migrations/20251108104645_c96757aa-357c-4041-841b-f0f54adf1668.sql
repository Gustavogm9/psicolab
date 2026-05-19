-- Adicionar campo para configuração de seções customizáveis
ALTER TABLE perfis_publicos
ADD COLUMN IF NOT EXISTS secoes_config jsonb DEFAULT '[
  {"id": "hero", "nome": "Hero Section", "visivel": true, "ordem": 0},
  {"id": "beneficios", "nome": "Benefícios", "visivel": true, "ordem": 1},
  {"id": "sobre", "nome": "Sobre", "visivel": true, "ordem": 2},
  {"id": "servicos", "nome": "Serviços", "visivel": true, "ordem": 3},
  {"id": "depoimentos", "nome": "Depoimentos", "visivel": true, "ordem": 4},
  {"id": "faq", "nome": "FAQ", "visivel": true, "ordem": 5},
  {"id": "diagnosticos", "nome": "Diagnósticos", "visivel": true, "ordem": 6}
]'::jsonb;