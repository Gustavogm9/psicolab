-- Adicionar novos campos em perfis_publicos para transformação visual
ALTER TABLE perfis_publicos 
  ADD COLUMN IF NOT EXISTS navbar_menu_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS navbar_cta_texto TEXT DEFAULT 'Agendar Consulta',
  ADD COLUMN IF NOT EXISTS navbar_cta_link TEXT DEFAULT '#contato',
  ADD COLUMN IF NOT EXISTS estatisticas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS processo_trabalho JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS especialidades JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mostrar_secao_conteudos BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS footer_texto_sobre TEXT;

-- Adicionar novas seções ao secoes_config padrão para perfis existentes
UPDATE perfis_publicos
SET secoes_config = secoes_config || 
  '[
    {"id": "numeros", "nome": "Números & Conquistas", "visivel": true, "ordem": 2},
    {"id": "como_funciona", "nome": "Como Funciona", "visivel": true, "ordem": 4},
    {"id": "especialidades", "nome": "Especialidades", "visivel": true, "ordem": 6}
  ]'::jsonb
WHERE secoes_config IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(secoes_config) AS elem
    WHERE elem->>'id' IN ('numeros', 'como_funciona', 'especialidades')
  );

-- Inserir exemplos padrão de estatísticas para novos perfis
UPDATE perfis_publicos
SET estatisticas = '[
  {
    "id": "1",
    "icone": "Award",
    "numero": "10+",
    "label": "Anos de Experiência",
    "descricao": "Atuando em psicologia clínica"
  },
  {
    "id": "2",
    "icone": "Users",
    "numero": "300+",
    "label": "Clientes Atendidos",
    "descricao": "Com resultados comprovados"
  },
  {
    "id": "3",
    "icone": "Star",
    "numero": "95%",
    "label": "Satisfação",
    "descricao": "Avaliação dos pacientes"
  }
]'::jsonb
WHERE estatisticas = '[]'::jsonb
  AND titulo_profissional IS NOT NULL;

-- Inserir exemplo padrão de processo de trabalho
UPDATE perfis_publicos
SET processo_trabalho = '[
  {
    "id": "1",
    "icone": "Calendar",
    "titulo": "Agende sua Consulta",
    "descricao": "Escolha o melhor horário para você através dos nossos canais de atendimento"
  },
  {
    "id": "2",
    "icone": "UserCheck",
    "titulo": "Primeira Sessão",
    "descricao": "Conhecer sua história, necessidades e definir objetivos terapêuticos"
  },
  {
    "id": "3",
    "icone": "Target",
    "titulo": "Plano Personalizado",
    "descricao": "Desenvolvimento de estratégias específicas para suas necessidades"
  },
  {
    "id": "4",
    "icone": "TrendingUp",
    "titulo": "Acompanhamento",
    "descricao": "Sessões regulares com evolução contínua e suporte dedicado"
  }
]'::jsonb
WHERE processo_trabalho = '[]'::jsonb
  AND titulo_profissional IS NOT NULL;

-- Inserir exemplos padrão de especialidades
UPDATE perfis_publicos
SET especialidades = '[
  {
    "id": "1",
    "icone": "User",
    "titulo": "Atendimento Individual",
    "descricao": "Terapia personalizada para adultos que buscam autoconhecimento e desenvolvimento pessoal",
    "destaque": true
  },
  {
    "id": "2",
    "icone": "Users",
    "titulo": "Terapia de Casal",
    "descricao": "Fortalecendo relacionamentos através de comunicação e entendimento mútuo",
    "destaque": false
  },
  {
    "id": "3",
    "icone": "Briefcase",
    "titulo": "Psicologia Organizacional",
    "descricao": "Consultoria para empresas focada em clima, cultura e bem-estar no trabalho",
    "destaque": true
  }
]'::jsonb
WHERE especialidades = '[]'::jsonb
  AND titulo_profissional IS NOT NULL;