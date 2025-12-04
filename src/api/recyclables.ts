import { supabase } from './supabaseClient';
import type { Recyclable, RecyclableOrder, CreateRecyclableInput, CreateOrderInput } from '../types/recyclable';

/**
 * Get all available recyclables
 */
export const getRecyclables = async (): Promise<Recyclable[]> => {
    const { data, error } = await supabase
        .from('recyclables')
        .select(`
      *,
      user_profiles (
        full_name,
        email,
        avatar_url,
        phone
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Get recyclable by ID
 */
export const getRecyclableById = async (id: string): Promise<Recyclable | null> => {
    const { data, error } = await supabase
        .from('recyclables')
        .select(`
      *,
      user_profiles (
        full_name,
        email,
        avatar_url,
        phone
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        if ('code' in error && error.code === 'PGRST116') return null;
        throw error;
    }

    return data || null;
};

/**
 * Get recyclables by user ID
 */
export const getUserRecyclables = async (userId: string): Promise<Recyclable[]> => {
    const { data, error } = await supabase
        .from('recyclables')
        .select(`
      *,
      user_profiles (
        full_name,
        email,
        avatar_url,
        phone
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Create a new recyclable listing
 */
export const createRecyclable = async (
    userId: string,
    input: CreateRecyclableInput
): Promise<Recyclable> => {
    const { data, error } = await supabase
        .from('recyclables')
        .insert({
            user_id: userId,
            ...input,
            status: 'available',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update a recyclable listing
 */
export const updateRecyclable = async (
    id: string,
    updates: Partial<CreateRecyclableInput>
): Promise<Recyclable> => {
    const { data, error } = await supabase
        .from('recyclables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete a recyclable listing
 */
export const deleteRecyclable = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('recyclables')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Update recyclable status
 */
export const updateRecyclableStatus = async (
    id: string,
    status: 'available' | 'sold' | 'reserved' | 'removed'
): Promise<Recyclable> => {
    const { data, error } = await supabase
        .from('recyclables')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Create an order for a recyclable
 */
export const createOrder = async (
    buyerId: string,
    input: CreateOrderInput
): Promise<RecyclableOrder> => {
    const { data, error } = await supabase
        .from('recyclable_orders')
        .insert({
            buyer_id: buyerId,
            ...input,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get orders for a user (as buyer or seller)
 */
export const getUserOrders = async (userId: string): Promise<RecyclableOrder[]> => {
    const { data, error } = await supabase
        .from('recyclable_orders')
        .select(`
      *,
      recyclables (*),
      buyer_profile:user_profiles!buyer_id (
        full_name,
        email,
        phone
      ),
      seller_profile:user_profiles!seller_id (
        full_name,
        email,
        phone
      )
    `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
    orderId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<RecyclableOrder> => {
    const { data, error } = await supabase
        .from('recyclable_orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Subscribe to recyclables changes
 */
export const subscribeToRecyclables = (
    callback: (payload: any) => void
) => {
    return supabase
        .channel('recyclables')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'recyclables'
            },
            callback
        )
        .subscribe();
};
