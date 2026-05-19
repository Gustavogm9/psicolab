-- Adicionar coluna peso na tabela avaliacoes_questoes
ALTER TABLE avaliacoes_questoes 
ADD COLUMN peso integer NOT NULL DEFAULT 5;

-- Adicionar constraint para validar o peso (entre 1 e 10)
ALTER TABLE avaliacoes_questoes
ADD CONSTRAINT peso_valido CHECK (peso >= 1 AND peso <= 10);

-- Comentário explicativo
COMMENT ON COLUMN avaliacoes_questoes.peso IS 'Peso da questão para cálculo de pontuação (1-10)';