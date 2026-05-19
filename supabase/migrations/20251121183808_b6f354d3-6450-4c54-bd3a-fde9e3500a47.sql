-- Fase 1: Tornar email opcional na tabela leads_diagnostico
ALTER TABLE leads_diagnostico 
ALTER COLUMN email DROP NOT NULL;