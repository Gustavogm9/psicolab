-- Adiciona coluna instrumento na tabela avaliacoes
-- Valores possíveis: 'copsoq_medio' | 'copsoq_curto' | 'generico' | NULL (= genérico)
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS instrumento TEXT DEFAULT NULL;
