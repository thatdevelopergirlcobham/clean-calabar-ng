export interface BookingRequest {
  serviceType: 'cleaning' | 'waste_pickup';
  location: string;
  date: string;
  time?: string;
  urgency: 'standard' | 'urgent';
  description: string;
  spaceSize?: 'small' | 'medium' | 'large';
  wasteSize?: 'small_bin' | 'large_bin' | 'truck_load';
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  selectedCleaner?: number; // cleaner ID
  estimatedPrice?: string;
}

export interface BookingState {
  step: 'service_type' | 'location' | 'date' | 'details' | 'contact' | 'complete';
  data: Partial<BookingRequest>;
}
