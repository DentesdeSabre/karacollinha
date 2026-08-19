-- =============================================
-- MIGRATION: Adicionar campos de frete
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Adicionar colunas de frete na tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(8,3) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS insurance_value NUMERIC(10,2) DEFAULT 0;

-- Adicionar CEP de origem nas configurações da loja
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS origin_postal_code TEXT DEFAULT '';
