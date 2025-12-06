import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reference, booking, cleaner } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your payment was successful and your booking has been confirmed.
          </p>

          {/* Reference Number */}
          {reference && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{reference}</p>
            </div>
          )}

          {/* Booking Details */}
          {cleaner && booking && (
            <div className="text-left bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Service Provider</h3>
              <p className="text-gray-700 font-medium">{cleaner.name}</p>
              <p className="text-sm text-gray-600 mt-1">⭐ {cleaner.rating} rating</p>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600">
                  The service provider will contact you at <span className="font-medium text-gray-900">{booking.contactPhone}</span> to confirm the details.
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">1.</span>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">2.</span>
                <span>The service provider will call you to confirm the appointment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">3.</span>
                <span>They'll arrive at your scheduled time</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => navigate('/community/hire-cleaners')}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Another Service
            </button>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:support@cleancal.ng" className="text-green-600 hover:underline">
              support@cleancal.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
