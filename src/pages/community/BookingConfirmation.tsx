import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  getBookingFromStorage, 
  clearBookingFromStorage, 
  matchCleanerToRequest,
  estimatePrice 
} from '../../utils/bookingFlow';
import { MOCK_CLEANERS } from '../../data/mockCleaners';
import type { Cleaner } from '../../data/mockCleaners';
import type { PaystackResponse } from '../../types/paystack';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertCircle,
  CreditCard,
  ArrowLeft
} from 'lucide-react';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking] = useState(getBookingFromStorage());
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/community/hire-cleaners');
      return;
    }

    // Match cleaner and estimate price
    const cleaner = booking.selectedCleaner 
      ? MOCK_CLEANERS.find(c => c.id === booking.selectedCleaner)
      : matchCleanerToRequest(booking);
    
    setSelectedCleaner(cleaner || null);
    setEstimatedPrice(estimatePrice(booking));
  }, [booking, navigate]);

  const handlePayment = () => {
    if (!user || !booking || !selectedCleaner) {
      console.error('Missing required data:', { user, booking, selectedCleaner });
      return;
    }

    // Check if Paystack is loaded
    if (!window.PaystackPop) {
      alert('Payment system is loading. Please wait a moment and try again.');
      console.error('Paystack not loaded. Check if script is in index.html');
      return;
    }

    setIsProcessing(true);

    // Extract price number from string like "₦10,000"
    const priceStr = estimatedPrice.replace(/[₦,]/g, '');
    const amount = parseInt(priceStr) * 100; // Paystack uses kobo (smallest currency unit)

    console.log('Initializing payment:', { amount, email: booking.contactEmail });

    try {
      // Initialize Paystack
      const handler = window.PaystackPop.setup({
      key: 'pk_live_fa0a541804703ca42042c3562e96a57e3baa71b1',
      email: booking.contactEmail || user.email || '',
      amount: amount,
      currency: 'NGN',
      ref: `CLEANCAL-${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Service Type",
            variable_name: "service_type",
            value: booking.serviceType || 'cleaning'
          },
          {
            display_name: "Cleaner",
            variable_name: "cleaner",
            value: selectedCleaner.name
          },
          {
            display_name: "Location",
            variable_name: "location",
            value: booking.location || ''
          }
        ]
      },
      callback: (response: PaystackResponse) => {
        // Payment successful
        console.log('Payment successful:', response);
        
        // Clear booking from storage
        clearBookingFromStorage();
        
        // Navigate to success page
        navigate('/community/booking-success', { 
          state: { 
            reference: response.reference,
            booking,
            cleaner: selectedCleaner
          } 
        });
      },
      onClose: () => {
        setIsProcessing(false);
        console.log('Payment window closed');
      }
    });

      handler.openIframe();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!booking || !selectedCleaner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
          {!booking && (
            <p className="text-sm text-red-600 mt-2">
              No booking data found. Please start from the booking page.
            </p>
          )}
          <button
            onClick={() => navigate('/community/hire-cleaners')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Booking Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/community/hire-cleaners')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Service Request
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Confirm Your Booking</h1>
          <p className="text-gray-600 mt-2">Review your details and proceed to payment</p>
        </div>

        <div className="space-y-6">
          {/* Selected Service Provider */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Service Provider</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{selectedCleaner.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">⭐ {selectedCleaner.rating}</span>
                  <span className="text-gray-500 text-sm">({selectedCleaner.reviews} reviews)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCleaner.specialties.map((specialty: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Experience: {selectedCleaner.experience}
                </p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Service Type</p>
                  <p className="text-gray-900">
                    {booking.serviceType === 'cleaning' ? '🧹 Cleaning Service' : '🚛 Waste Pickup'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{booking.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-gray-900">
                    {booking.date}
                    {booking.time && ` at ${booking.time}`}
                    {booking.urgency === 'urgent' && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        Urgent
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {booking.description && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-gray-900">{booking.description}</p>
                  </div>
                </div>
              )}

              {booking.spaceSize && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Space Size</p>
                    <p className="text-gray-900 capitalize">{booking.spaceSize}</p>
                  </div>
                </div>
              )}

              {booking.wasteSize && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Waste Size</p>
                    <p className="text-gray-900 capitalize">{booking.wasteSize.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{booking.contactName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{booking.contactPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{booking.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Estimated Price</h2>
              <p className="text-3xl font-bold text-green-600">{estimatedPrice}</p>
            </div>
            <p className="text-sm text-gray-600">
              Final price may vary based on actual service requirements. The service provider will confirm the exact amount.
            </p>
          </div>

          {/* Payment Button */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/community/hire-cleaners')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Edit Details
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Secure payment powered by Paystack. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
