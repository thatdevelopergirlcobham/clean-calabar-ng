import type { BookingRequest, BookingState } from '../types/booking';
import { MOCK_CLEANERS } from '../data/mockCleaners';

export const BOOKING_STORAGE_KEY = 'cleancal_booking_request';

export function saveBookingToStorage(booking: Partial<BookingRequest>): void {
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(booking));
}

export function getBookingFromStorage(): Partial<BookingRequest> | null {
  const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearBookingFromStorage(): void {
  localStorage.removeItem(BOOKING_STORAGE_KEY);
}

export function matchCleanerToRequest(booking: Partial<BookingRequest>) {
  if (!booking.serviceType) return null;

  const isWastePickup = booking.serviceType === 'waste_pickup';
  
  // Filter cleaners by service type
  const matchingCleaners = MOCK_CLEANERS.filter(cleaner => {
    if (isWastePickup) {
      return cleaner.specialties.some(s => 
        s.toLowerCase().includes('waste') || 
        s.toLowerCase().includes('pickup') ||
        s.toLowerCase().includes('removal')
      );
    } else {
      return cleaner.specialties.some(s => 
        s.toLowerCase().includes('clean')
      );
    }
  });

  // Sort by rating and availability
  const sortedCleaners = matchingCleaners.sort((a, b) => {
    // Prioritize urgent availability if needed
    if (booking.urgency === 'urgent') {
      const aUrgent = a.availability.includes('Today') || a.availability.includes('24/7');
      const bUrgent = b.availability.includes('Today') || b.availability.includes('24/7');
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
    }
    // Then by rating
    return b.rating - a.rating;
  });

  return sortedCleaners[0] || null;
}

export function estimatePrice(booking: Partial<BookingRequest>): string {
  const { serviceType, spaceSize, wasteSize, urgency } = booking;
  
  let basePrice = 5000;
  
  if (serviceType === 'cleaning') {
    if (spaceSize === 'small') basePrice = 5000;
    else if (spaceSize === 'medium') basePrice = 10000;
    else if (spaceSize === 'large') basePrice = 15000;
  } else if (serviceType === 'waste_pickup') {
    if (wasteSize === 'small_bin') basePrice = 3000;
    else if (wasteSize === 'large_bin') basePrice = 8000;
    else if (wasteSize === 'truck_load') basePrice = 15000;
  }
  
  // Add urgency fee
  if (urgency === 'urgent') {
    basePrice = Math.round(basePrice * 1.3); // 30% urgency fee
  }
  
  return `₦${basePrice.toLocaleString()}`;
}
