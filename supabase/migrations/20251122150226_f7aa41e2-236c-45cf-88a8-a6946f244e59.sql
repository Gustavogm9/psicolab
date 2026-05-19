-- Adicionar campo cpf_cnpj à tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN cpf_cnpj TEXT;

-- Criar índice para busca por CPF/CNPJ
CREATE INDEX idx_clientes_cpf_cnpj ON public.clientes(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.clientes.cpf_cnpj IS 'CPF ou CNPJ do cliente (apenas números, sem formatação)';