import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ImageUploader from '../../components/common/ImageUploader';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { Truck, Sparkles, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { createServiceRequest } from '../../api/serviceRequests';

type ServiceType = 'cleaning' | 'waste_pickup';
type UrgencyLevel = 'standard' | 'urgent';

interface ServiceRequestForm {
  service_type: ServiceType;
  location: { lat: number; lng: number; address: string } | null;
  service_date: string;
  service_time: string;
  urgency: UrgencyLevel;
  description: string;
  images: string[];
  contact_phone: string;
  contact_email: string;
  notes: string;
  space_size?: string; // for cleaning
  waste_size?: string; // for waste pickup
}

const initialState: ServiceRequestForm = {
  service_type: 'cleaning',
  location: null,
  service_date: '',
  service_time: '',
  urgency: 'standard',
  description: '',
  images: [],
  contact_phone: '',
  contact_email: '',
  notes: '',
  space_size: 'medium',
  waste_size: 'small_bin',
};

const HireCleaners: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ServiceRequestForm>(initialState);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    if (url) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');

    if (!user) {
      console.log('No user logged in');
      setError('Please login to submit a request');
      return;
    }

    if (isUploadingImage) {
      console.log('Image upload in progress');
      setError('Please wait for images to finish uploading');
      return;
    }

    if (!formData.location) {
      console.log('No location selected');
      setError('Please select a location');
      return;
    }

    if (!formData.service_date) {
      console.log('No date selected');
      setError('Please select a date');
      return;
    }

    console.log('Submitting data:', formData);
    setLoading(true);
    setError(null);

    try {
      console.log('Calling API now...');
      // Use the dedicated API function
      const result = await createServiceRequest({
        user_id: user.id,
        service_type: formData.service_type,
        location: formData.location,
        service_date: formData.service_date,
        service_time: formData.urgency === 'urgent' ? 'urgent' : formData.service_time,
        urgency: formData.urgency,
        description: formData.description,
        images: formData.images,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        notes: formData.notes,
        space_size: formData.service_type === 'cleaning' ? formData.space_size : null,
        waste_size: formData.service_type === 'waste_pickup' ? formData.waste_size : null,
      });
      console.log('API call returned:', result);

      console.log('Submission successful');
      setSuccess(true);
      setFormData(initialState);
      window.scrollTo(0, 0);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Submission error caught in component:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Request</h1>
          <p className="text-lg text-gray-600">
            Hire professional cleaners or schedule a fast waste pickup.
          </p>
        </div>

        {/* Service Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, service_type: 'cleaning' }))}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formData.service_type === 'cleaning'
              ? 'border-green-600 bg-green-50 text-green-700 shadow-md'
              : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'
              }`}
          >
            <Sparkles className="w-8 h-8" />
            <span className="font-semibold text-lg">Hire Cleaners</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, service_type: 'waste_pickup' }))}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formData.service_type === 'waste_pickup'
              ? 'border-green-600 bg-green-50 text-green-700 shadow-md'
              : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'
              }`}
          >
            <Truck className="w-8 h-8" />
            <span className="font-semibold text-lg">Waste Pickup</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> Your request has been submitted successfully. We will contact you shortly.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Location Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Location <span className="text-red-500">*</span>
                    </label>
                    <LocationAutocomplete
                      value={formData.location?.address || ''}
                      onChange={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
                      placeholder="Search for your address..."
                    />
                  </div>
                </div>
              </section>

              {/* Service Details */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Timing & Urgency
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="service_date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.service_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    >
                      <option value="standard">Standard Schedule</option>
                      <option value="urgent">Urgent (ASAP)</option>
                    </select>
                  </div>

                  {formData.urgency === 'standard' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        name="service_time"
                        required
                        value={formData.service_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Specific Details based on Type */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {formData.service_type === 'cleaning' ? (
                    <Sparkles className="w-5 h-5 text-green-600" />
                  ) : (
                    <Truck className="w-5 h-5 text-green-600" />
                  )}
                  {formData.service_type === 'cleaning' ? 'Cleaning Details' : 'Waste Details'}
                </h3>

                <div className="space-y-6">
                  {formData.service_type === 'cleaning' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Space Size
                      </label>
                      <select
                        name="space_size"
                        value={formData.space_size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      >
                        <option value="small">Small (Studio/1 Bedroom)</option>
                        <option value="medium">Medium (2-3 Bedrooms)</option>
                        <option value="large">Large (4+ Bedrooms/Office)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approximate Waste Size
                      </label>
                      <select
                        name="waste_size"
                        value={formData.waste_size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      >
                        <option value="small_bin">Small Bin (Household)</option>
                        <option value="large_bin">Large Bin (Commercial)</option>
                        <option value="truck_load">Truck Load (Construction/Bulk)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={formData.service_type === 'cleaning'
                        ? "Describe the cleaning required (e.g., deep cleaning, move-in/out)..."
                        : "Describe the waste to be picked up..."}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images (Optional)
                    </label>
                    <div className="space-y-4">
                      <ImageUploader
                        onImageUpload={handleImageUpload}
                        onUploadStart={() => setIsUploadingImage(true)}
                        onUploadEnd={() => setIsUploadingImage(false)}
                        className="w-full"
                      />
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.images.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      required
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      required
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialState)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploadingImage}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : isUploadingImage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading Image...
                    </>
                  ) : (
                    <>
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireCleaners;