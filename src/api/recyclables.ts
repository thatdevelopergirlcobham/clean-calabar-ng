import type { Recyclable, RecyclableOrder, CreateRecyclableInput, CreateOrderInput } from '../types/recyclable';

// Dummy data for recyclables
const DUMMY_RECYCLABLES: Recyclable[] = [
    // {
    //     id: 'dummy-1',
    //     user_id: 'user-1',
    //     title: '50kg of PET Bottles',
    //     description: 'Clean, sorted PET bottles ready for pickup. Mostly water bottles.',
    //     category: 'plastic',
    //     bottle_size: '50cl',
    //     quantity: 50,
    //     price_per_unit: 100,
    //     total_price: 5000,
    //     image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     location: { lat: 4.9757, lng: 8.3417 }, // Calabar coordinates
    //     status: 'available',
    //     is_negotiable: true,
    //     contact_phone: '08012345678',
    //     created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    //     updated_at: new Date(Date.now() - 86400000).toISOString(),
    //     user_profiles: {
    //         full_name: 'John Doe',
    //         email: 'john@example.com',
    //         avatar_url: 'https://ui-avatars.com/api/?name=John+Doe',
    //         phone: '08012345678'
    //     }
    // },
    {
        id: 'dummy-2',
        user_id: 'user-2',
        title: 'Plastics Bottles Collection',
        description: 'Mixed glass bottles, mostly green and brown.',
        category: 'plastic',
        quantity: 100,
        price_per_unit: 50,
        total_price: 5000,
        image_url: 'https://eupegypt.com/wp-content/uploads/2024/12/pet-plastic-bottles.jpg',
        location: { lat: 4.9800, lng: 8.3500 },
        status: 'available',
        is_negotiable: false,
        contact_phone: '08087654321',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        user_profiles: {
            full_name: 'Dawn Cobham',
            email: 'Cobham@gmail.com',
            avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith',
            phone: '08087654321'
        }
    }
];

const LOCAL_STORAGE_KEY = 'clean_calabar_recyclables';

/**
 * Get all available recyclables
 */
export const getRecyclables = async (): Promise<Recyclable[]> => {
    // Commented out Supabase fetch
    /*
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
    */

    // Fetch from Local Storage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const localRecyclables: Recyclable[] = stored ? JSON.parse(stored) : [];

    // Combine dummy data and local data
    // Sort by created_at descending
    const allRecyclables = [...localRecyclables, ...DUMMY_RECYCLABLES].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return allRecyclables;
};

/**
 * Get recyclable by ID
 */
export const getRecyclableById = async (id: string): Promise<Recyclable | null> => {
    // Check dummy data first
    const dummy = DUMMY_RECYCLABLES.find(r => r.id === id);
    if (dummy) return dummy;

    // Check local storage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        const localRecyclables: Recyclable[] = JSON.parse(stored);
        const local = localRecyclables.find(r => r.id === id);
        if (local) return local;
    }

    // Fallback to Supabase if not found (or just return null if we want to fully mock)
    // For now, let's keep the Supabase call as a fallback or comment it out if strictly no Supabase.
    // The user said "stop the fetch from supabase", so let's just return null if not found in dummy/local.

    /*
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
    */
    return null;
};

/**
 * Get recyclables by user ID
 */
export const getUserRecyclables = async (userId: string): Promise<Recyclable[]> => {
    // Filter from combined data
    const all = await getRecyclables();
    return all.filter(r => r.user_id === userId);
};

/**
 * Create a new recyclable listing
 */
export const createRecyclable = async (
    userId: string,
    input: CreateRecyclableInput
): Promise<Recyclable> => {
    // Commented out Supabase insert
    /*
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
    */

    // Simulate creation
    const newRecyclable: Recyclable = {
        id: `local-${Date.now()}`,
        user_id: userId,
        ...input,
        is_negotiable: input.is_negotiable ?? false,
        status: 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Mock user profile since we don't have the join
        user_profiles: {
            full_name: 'Current User', // Ideally we'd get this from context but here we mock
            email: 'user@example.com',
            avatar_url: null,
            phone: input.contact_phone
        },
        total_price: input.quantity * input.price_per_unit // Calculate total price
    };

    // Save to Local Storage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const localRecyclables: Recyclable[] = stored ? JSON.parse(stored) : [];
    localRecyclables.unshift(newRecyclable); // Add to beginning
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localRecyclables));

    return newRecyclable;
};

/**
 * Update a recyclable listing
 */
export const updateRecyclable = async (
    id: string,
    updates: Partial<CreateRecyclableInput>
): Promise<Recyclable> => {
    // Handle local storage update
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        let localRecyclables: Recyclable[] = JSON.parse(stored);
        const index = localRecyclables.findIndex(r => r.id === id);
        if (index !== -1) {
            localRecyclables[index] = { ...localRecyclables[index], ...updates, updated_at: new Date().toISOString() };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localRecyclables));
            return localRecyclables[index];
        }
    }

    throw new Error('Recyclable not found or cannot be updated in this mock mode');
};

/**
 * Delete a recyclable listing
 */
export const deleteRecyclable = async (id: string): Promise<void> => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        let localRecyclables: Recyclable[] = JSON.parse(stored);
        const newRecyclables = localRecyclables.filter(r => r.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newRecyclables));
    }
};

/**
 * Update recyclable status
 */
export const updateRecyclableStatus = async (
    id: string,
    status: 'available' | 'sold' | 'reserved' | 'removed'
): Promise<Recyclable> => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        let localRecyclables: Recyclable[] = JSON.parse(stored);
        const index = localRecyclables.findIndex(r => r.id === id);
        if (index !== -1) {
            localRecyclables[index] = { ...localRecyclables[index], status, updated_at: new Date().toISOString() };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localRecyclables));
            return localRecyclables[index];
        }
    }
    throw new Error('Recyclable not found');
};

/**
 * Create an order for a recyclable
 */
export const createOrder = async (
    buyerId: string,
    input: CreateOrderInput
): Promise<RecyclableOrder> => {
    // Mock order creation
    const newOrder: RecyclableOrder = {
        id: `order-${Date.now()}`,
        buyer_id: buyerId,
        ...input,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    return newOrder;
};

/**
 * Get orders for a user (as buyer or seller)
 */
export const getUserOrders = async (_userId: string): Promise<RecyclableOrder[]> => {
    return [];
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
    _orderId: string,
    _status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<RecyclableOrder> => {
    throw new Error('Not implemented in mock');
};

/**
 * Subscribe to recyclables changes
 */
export const subscribeToRecyclables = (
    _callback: (payload: any) => void
) => {
    // Mock subscription - do nothing or setup a local event listener if needed
    // For now, just return a dummy unsubscribe
    return {
        unsubscribe: () => { }
    };
};

