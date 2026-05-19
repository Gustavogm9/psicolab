-- Políticas RLS para admins em perfil-imagens
CREATE POLICY "Admins podem fazer upload em perfil-imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'perfil-imagens' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar em perfil-imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'perfil-imagens' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar em perfil-imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'perfil-imagens' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Políticas RLS para admins em portfolio-images
CREATE POLICY "Admins podem fazer upload em portfolio-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar em portfolio-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar em portfolio-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Políticas RLS para admins em marca-logos
CREATE POLICY "Admins podem fazer upload em marca-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marca-logos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar em marca-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marca-logos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar em marca-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marca-logos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Políticas RLS para admins em intervencoes-anexos
CREATE POLICY "Admins podem fazer upload em intervencoes-anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'intervencoes-anexos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar em intervencoes-anexos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'intervencoes-anexos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar em intervencoes-anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'intervencoes-anexos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);