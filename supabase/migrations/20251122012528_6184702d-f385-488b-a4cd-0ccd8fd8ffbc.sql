-- Adicionar campos de rastreamento na tabela perfis_publicos
ALTER TABLE perfis_publicos 
ADD COLUMN gtm_id TEXT,
ADD COLUMN facebook_pixel_id TEXT,
ADD COLUMN google_analytics_id TEXT;

COMMENT ON COLUMN perfis_publicos.gtm_id IS 'Google Tag Manager Container ID (GTM-XXXXXXX)';
COMMENT ON COLUMN perfis_publicos.facebook_pixel_id IS 'Facebook/Meta Pixel ID';
COMMENT ON COLUMN perfis_publicos.google_analytics_id IS 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)';