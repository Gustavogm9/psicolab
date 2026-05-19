-- Tornar resposta_id opcional em leads_diagnostico
ALTER TABLE leads_diagnostico 
ALTER COLUMN resposta_id DROP NOT NULL;

-- Atualizar foreign key para permitir NULL e SET NULL on delete
ALTER TABLE leads_diagnostico 
DROP CONSTRAINT IF EXISTS leads_diagnostico_resposta_id_fkey;

ALTER TABLE leads_diagnostico 
ADD CONSTRAINT leads_diagnostico_resposta_id_fkey 
FOREIGN KEY (resposta_id) 
REFERENCES respostas_diagnostico(id) 
ON DELETE SET NULL;