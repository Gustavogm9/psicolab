-- Adicionar coluna cpf_cnpj na tabela leads_diagnostico
ALTER TABLE public.leads_diagnostico 
ADD COLUMN cpf_cnpj VARCHAR(18) NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.leads_diagnostico.cpf_cnpj IS 'CPF ou CNPJ do lead, necessário para emissão de faturas quando convertido em cliente';