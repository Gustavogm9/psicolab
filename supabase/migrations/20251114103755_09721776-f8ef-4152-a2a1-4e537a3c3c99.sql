-- Fase 1: Ajustar estrutura de white-label para permitir configuração por consultor

-- Adicionar user_id à tabela de configurações
ALTER TABLE configuracoes_whitelabel 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_whitelabel_user_id ON configuracoes_whitelabel(user_id);

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins podem visualizar configurações whitelabel" ON configuracoes_whitelabel;
DROP POLICY IF EXISTS "Admins podem criar configurações whitelabel" ON configuracoes_whitelabel;
DROP POLICY IF EXISTS "Admins podem atualizar configurações whitelabel" ON configuracoes_whitelabel;

-- Criar novas políticas para consultores gerenciarem suas próprias configs
CREATE POLICY "Consultores podem ver suas configurações"
ON configuracoes_whitelabel FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Consultores podem criar suas configurações"
ON configuracoes_whitelabel FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Consultores podem atualizar suas configurações"
ON configuracoes_whitelabel FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Consultores podem deletar suas configurações"
ON configuracoes_whitelabel FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar bucket para logos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('marca-logos', 'marca-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de logos
CREATE POLICY "Usuários podem fazer upload de seus logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marca-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar seus logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marca-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marca-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Logos são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marca-logos');