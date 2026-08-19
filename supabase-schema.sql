-- =============================================
-- SCHEMA: Karacol & Linha - Loja de Produtos Artesanais
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: store_settings (Configurações da loja)
-- =============================================
CREATE TABLE store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_name TEXT DEFAULT 'Karacol & Linha',
  store_slogan TEXT DEFAULT 'Produtos artesanais feitos com amor e carinho',
  whatsapp_number TEXT DEFAULT '5511999999999',
  store_description TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#c08552',
  secondary_color TEXT DEFAULT '#e8b4b8',
  origin_postal_code TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO store_settings (store_name, store_slogan, whatsapp_number)
VALUES ('Karacol & Linha', 'Produtos artesanais feitos com amor e carinho', '5511999999999')
ON CONFLICT DO NOTHING;

-- =============================================
-- TABELA: categories (Categorias)
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: products (Produtos)
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  promo_price NUMERIC(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_promo BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  weight NUMERIC(8,3) DEFAULT 0,
  height INTEGER DEFAULT 0,
  width INTEGER DEFAULT 0,
  length INTEGER DEFAULT 0,
  insurance_value NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: product_images (Imagens dos produtos)
-- =============================================
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT auth.jwt() ->> 'email' IN ('admin@sualoja.com');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas para store_settings (leitura pública, escrita apenas admin)
CREATE POLICY "Permitir leitura pública de configurações"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Permitir atualização de configurações para admin"
  ON store_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir inserção de configurações para admin"
  ON store_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- Políticas para categories (leitura pública, escrita apenas admin)
CREATE POLICY "Permitir leitura pública de categorias"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção de categorias para admin"
  ON categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de categorias para admin"
  ON categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir exclusão de categorias para admin"
  ON categories FOR DELETE
  USING (public.is_admin());

-- Políticas para products (leitura pública de ativos, escrita apenas admin)
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

-- Políticas para product_images (leitura pública, escrita apenas admin)
CREATE POLICY "Permitir leitura pública de imagens"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção de imagens para admin"
  ON product_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de imagens para admin"
  ON product_images FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Permitir exclusão de imagens para admin"
  ON product_images FOR DELETE
  USING (public.is_admin());

-- =============================================
-- STORAGE (Supabase Storage)
-- =============================================

-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Políticas para bucket product-images
CREATE POLICY "Permitir leitura pública de imagens de produtos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Permitir upload de imagens de produtos para admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Permitir exclusão de imagens de produtos para admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Criar bucket para imagens da loja (logo e banner)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-settings', 'store-settings', true)
ON CONFLICT DO NOTHING;

-- Políticas para bucket store-settings
CREATE POLICY "Permitir leitura pública de imagens da loja"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-settings');

CREATE POLICY "Permitir upload de imagens da loja para admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-settings' AND public.is_admin());

CREATE POLICY "Permitir exclusão de imagens da loja para admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-settings' AND public.is_admin());

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_promo ON products(is_promo);
CREATE INDEX idx_products_sort ON products(sort_order);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================
-- TRIGGER: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CRIAR USUÁRIO ADMIN no Supabase Auth
-- =============================================
-- IMPORTANTE: Crie o usuário admin pela interface do Supabase:
-- Authentication → Users → Add User
-- Email: admin@sualoja.com
-- Senha: (escolha uma senha segura)
-- 
-- OU execute via SQL:
-- SELECT auth.users ('admin@sualoja.com', 'sua_senha_segura');
