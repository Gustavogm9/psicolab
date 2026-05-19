-- Adicionar campos para verificação de SSL nos domínios customizados
ALTER TABLE public.dominios_customizados
ADD COLUMN ssl_status TEXT DEFAULT 'pendente' CHECK (ssl_status IN ('pendente', 'provisionando', 'ativo', 'erro', 'expirado')),
ADD COLUMN ssl_verificado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN ssl_valido_ate TIMESTAMP WITH TIME ZONE,
ADD COLUMN ssl_erro_mensagem TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.dominios_customizados.ssl_status IS 'Status do certificado SSL: pendente, provisionando, ativo, erro, expirado';
COMMENT ON COLUMN public.dominios_customizados.ssl_verificado_em IS 'Data da última verificação do SSL';
COMMENT ON COLUMN public.dominios_customizados.ssl_valido_ate IS 'Data de expiração do certificado SSL';
COMMENT ON COLUMN public.dominios_customizados.ssl_erro_mensagem IS 'Mensagem de erro caso o SSL falhe';

-- Atualizar domínios ativos existentes para status 'provisionando'
UPDATE public.dominios_customizados
SET ssl_status = 'provisionando'
WHERE status = 'ativo' AND ssl_status = 'pendente';