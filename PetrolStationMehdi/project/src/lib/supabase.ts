import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LocalizedText = {
  en?: string;
  fr?: string;
  ar?: string;
};

export type ProductStory = {
  whatItDoes: string;
  features: string[];
  problemSolves: string;
  bestFor: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  descriptions?: LocalizedText | null;
  story?: { en: ProductStory; fr: ProductStory; ar: ProductStory } | null;
  price: number;
  sale_price: number | null;
  on_sale: boolean;
  category: string;
  image_url: string | null;
  unit: string;
  available: boolean;
  featured: boolean;
  stock: number | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  notes: string | null;
  total: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  created_at: string;
};

export type FuelPrice = {
  id: string;
  fuel_type: string;
  price: number;
  unit: string;
  updated_at: string;
};

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'gas', label: 'Gas' },
  { key: 'service', label: 'Services' },
  { key: 'convenience', label: 'Shop' },
] as const;

export const STORE_PHONE = '0550294009';
export const STORE_PHONE_DISPLAY = '0550 29 40 09';
export const STORE_WHATSAPP = '213550294009';
