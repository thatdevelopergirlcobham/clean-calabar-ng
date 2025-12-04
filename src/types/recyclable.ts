export type RecyclableCategory = 'plastic' | 'glass' | 'metal' | 'paper' | 'cardboard' | 'other';
export type RecyclableStatus = 'available' | 'sold' | 'reserved' | 'removed';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const BOTTLE_SIZES = [
  '50cl',
  '60cl',
  '75cl',
  '1 liter',
  '1.5 liter',
  '2 liter',
  '3 liter',
  '5 liter',
  'Other'
] as const;

export type BottleSize = typeof BOTTLE_SIZES[number];

export interface Recyclable {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: RecyclableCategory;
  bottle_size?: BottleSize;
  quantity: number;
  price_per_unit: number;
  total_price?: number;
  image_url?: string;
  location?: { lat: number; lng: number } | string | null;
  status: RecyclableStatus;
  is_negotiable: boolean;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user_profiles?: {
    full_name: string;
    email?: string;
    avatar_url?: string | null;
    phone?: string;
  } | null;
}

export interface RecyclableOrder {
  id: string;
  recyclable_id: string;
  buyer_id: string;
  seller_id: string;
  quantity_ordered: number;
  total_amount: number;
  status: OrderStatus;
  buyer_notes?: string;
  seller_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  recyclables?: Recyclable;
  buyer_profile?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  seller_profile?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateRecyclableInput {
  title: string;
  description?: string;
  category: RecyclableCategory;
  bottle_size?: BottleSize;
  quantity: number;
  price_per_unit: number;
  image_url?: string;
  location?: { lat: number; lng: number };
  is_negotiable?: boolean;
  contact_phone?: string;
}

export interface CreateOrderInput {
  recyclable_id: string;
  seller_id: string;
  quantity_ordered: number;
  total_amount: number;
  buyer_notes?: string;
}
