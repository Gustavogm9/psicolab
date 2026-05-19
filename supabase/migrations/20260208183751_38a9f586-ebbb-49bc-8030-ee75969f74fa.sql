-- Alterar valores padrão das colunas de CTA para âncoras válidas
ALTER TABLE perfis_publicos 
  ALTER COLUMN cta_hero_link SET DEFAULT '#contato',
  ALTER COLUMN cta_flutuante_link SET DEFAULT '#contato',
  ALTER COLUMN cta_intermediario_botao_link SET DEFAULT '#contato',
  ALTER COLUMN cta_rodape_botao_link SET DEFAULT '#contato';

-- Corrigir dados existentes com rotas internas inválidas
-- /diagnostico é uma rota interna, não funciona em domínio customizado
UPDATE perfis_publicos 
SET cta_hero_link = '#contato' 
WHERE cta_hero_link = '/diagnostico';

-- /contato é uma rota interna, deve ser âncora #contato
UPDATE perfis_publicos 
SET cta_flutuante_link = '#contato' 
WHERE cta_flutuante_link = '/contato';

UPDATE perfis_publicos 
SET cta_intermediario_botao_link = '#contato' 
WHERE cta_intermediario_botao_link = '/contato';

UPDATE perfis_publicos 
SET cta_rodape_botao_link = '#contato' 
WHERE cta_rodape_botao_link = '/contato';