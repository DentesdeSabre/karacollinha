export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promo_price: number | null;
  category_id: string;
  is_promo: boolean;
  is_featured: boolean;
  is_active: boolean;
  stock: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_slogan: string;
  whatsapp_number: string;
  store_description: string;
  banner_url: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}
