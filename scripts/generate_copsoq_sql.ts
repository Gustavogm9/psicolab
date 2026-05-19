import { COPSOQ_MEDIO_QUESTOES } from "../src/lib/copsoq-questoes";
import * as fs from "fs";

const questoes = COPSOQ_MEDIO_QUESTOES.map((q) => ({
    id: `copsoq-${q.ordem}`,
    pergunta: q.pergunta,
    tipo: q.tipo,
    obrigatoria: q.obrigatoria,
    categoria: q.categoria,
    peso: q.peso,
    ordem: q.ordem,
    opcoes: [],
}));

const jsonString = JSON.stringify(questoes).replace(/'/g, "''"); // escape single quotes for SQL

const sql = `
-- Migration to update all existing COPSOQ Medio forms and templates with the new 76 refined questions
BEGIN;

-- 1. Updates para os TEMPLATES (estes usam JSONB em \`questoes\`)
UPDATE avaliacoes_templates
SET questoes = '${jsonString}'::jsonb
WHERE nome LIKE '%COPSOQ%' OR nome LIKE '%Copsoq%';

-- 2. Updates para as AVALIACOES instanciadas (estas usam tabela relacional \`avaliacoes_questoes\`)
-- Como são 76 perguntas padronizadas, a forma mais segura de retroatividade global é limpar e reinserir 
-- os blocos originais do copsoq_medio para não misturar UUIDs e IDs velhos.

-- 2.1 Limpa as questões antigas das avaliações que são COPSOQ Médio
DELETE FROM avaliacoes_questoes 
WHERE avaliacao_id IN (
    SELECT id FROM avaliacoes WHERE instrumento = 'copsoq_medio'
);

-- 2.2 Reinsere o bloco de 76 questões para CADA avaliação atrelada
INSERT INTO avaliacoes_questoes (avaliacao_id, tipo, obrigatoria, categoria, peso, ordem, pergunta, opcoes)
SELECT 
    a.id,
    (q->>'tipo')::questao_tipo, 
    (q->>'obrigatoria')::boolean,
    q->>'categoria',
    (q->>'peso')::integer,
    (q->>'ordem')::integer,
    q->>'pergunta',
    (q->>'opcoes')::jsonb
FROM avaliacoes a
CROSS JOIN LATERAL jsonb_array_elements('${jsonString}'::jsonb) AS q
WHERE a.instrumento = 'copsoq_medio';

COMMIT;
`;

fs.writeFileSync("supabase/migrations/20260301_update_copsoq_questions.sql", sql);
console.log("Migration generated successfully!");
