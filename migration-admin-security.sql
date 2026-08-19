-- =============================================
-- MIGRAÇÃO: Restringir admin por email
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Criar função is_admin() que verifica o email do JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT auth.jwt() ->> 'email' IN ('admin@sualoja.com');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Remover políticas antigas que usam auth.role() = 'authenticated'
-- store_settings
DROP POLICY IF EXISTS "Permitir atualização de configurações para autenticados" ON store_settings;
DROP POLICY IF EXISTS "Permitir inserção de configurações para autenticados" ON store_settings;

-- categories
DROP POLICY IF EXISTS "Permitir inserção de categorias para autenticados" ON categories;
DROP POLICY IF EXISTS "Permitir atualização de categorias para autenticados" ON categories;
DROP POLICY IF EXISTS "Permitir exclusão de categorias para autenticados" ON categories;

-- products
DROP POLICY IF EXISTS "Permitir leitura pública de produtos ativos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos para autenticados" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos para autenticados" ON products;
DROP POLICY IF EXISTS "Permitir exclusão de produtos para autenticados" ON products;

-- product_images
DROP POLICY IF EXISTS "Permitir inserção de imagens para autenticados" ON product_images;
DROP POLICY IF EXISTS "Permitir atualização de imagens para autenticados" ON product_images;
DROP POLICY IF EXISTS "Permitir exclusão de imagens para autenticados" ON product_images;

-- 3. Criar novas políticas usando is_admin()
-- store_settings
CREATE POLICY "Permitir atualização de configurações para admin"
  ON store_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir inserção de configurações para admin"
  ON store_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- categories
CREATE POLICY "Permitir inserção de categorias para admin"
  ON categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de categorias para admin"
  ON categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir exclusão de categorias para admin"
  ON categories FOR DELETE
  USING (public.is_admin());

-- products
CREATE POLICY "Permitir leitura pública de produtos ativos"
  ON products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Permitir inserção de produtos para admin"
  ON products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de produtos para admin"
  ON products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir exclusão de produtos para admin"
  ON products FOR DELETE
  USING (public.is_admin());

-- product_images
CREATE POLICY "Permitir inserção de imagens para admin"
  ON product_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de imagens para admin"
  ON product_images FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir exclusão de imagens para admin"
  ON product_images FOR DELETE
  USING (public.is_admin());

-- 4. Atualizar políticas de Storage para usar is_admin()
-- product-images bucket
DROP POLICY IF EXISTS "Permitir upload de imagens de produtos para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens de produtos para autenticados" ON storage.objects;

CREATE POLICY "Permitir upload de imagens de produtos para admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Permitir exclusão de imagens de produtos para admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- store-settings bucket
DROP POLICY IF EXISTS "Permitir upload de imagens da loja para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens da loja para autenticados" ON storage.objects;

CREATE POLICY "Permitir upload de imagens da loja para admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-settings' AND public.is_admin());

CREATE POLICY "Permitir exclusão de imagens da loja para admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-settings' AND public.is_admin());
