// import { supabase } from './supabaseClient';

export interface ServiceRequestInput {
    user_id: string;
    service_type: 'cleaning' | 'waste_pickup';
    location: { lat: number; lng: number; address: string };
    service_date: string;
    service_time: string;
    urgency: 'standard' | 'urgent';
    description: string;
    images: string[];
    contact_phone: string;
    contact_email: string;
    notes: string;
    space_size?: string | null;
    waste_size?: string | null;
}

export const createServiceRequest = async (data: ServiceRequestInput) => {
    console.log('API: Creating service request (SIMULATION)...', data);

    // Simulate 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return dummy success response
    return {
        id: `req-${Date.now()}`,
        ...data,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    /*
    try {
        const { data: result, error } = await supabase
            .from('service_requests')
            .insert([
                {
                    ...data,
                    status: 'pending' // Default status
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('API: Error creating service request:', error);
            throw error;
        }

        console.log('API: Service request created successfully:', result);
        return result;
    } catch (err) {
        console.error('API: Unexpected error in createServiceRequest:', err);
        throw err;
    }
    */
};

