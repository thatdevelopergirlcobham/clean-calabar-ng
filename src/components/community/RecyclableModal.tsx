import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../common/ImageUploader';
import LocationAutocomplete from '../common/LocationAutocomplete';
import { BOTTLE_SIZES, type CreateRecyclableInput, type RecyclableCategory } from '../../types/recyclable';

interface RecyclableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateRecyclableInput) => Promise<void>;
}

const CATEGORIES: { value: RecyclableCategory; label: string }[] = [
    { value: 'plastic', label: 'Plastic Bottles' },
    { value: 'glass', label: 'Glass Bottles' },
    { value: 'metal', label: 'Metal/Aluminum' },
    { value: 'paper', label: 'Paper/Cardboard' },
    { value: 'cardboard', label: 'Cardboard Boxes' },
    { value: 'other', label: 'Other Recyclables' },
];

const RecyclableModal: React.FC<RecyclableModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<CreateRecyclableInput>({
        title: '',
        description: '',
        category: 'plastic',
        bottle_size: '1 liter',
        quantity: 1,
        price_per_unit: 0,
        image_url: '',
        location: undefined,
        is_negotiable: true,
        contact_phone: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (name === 'quantity' || name === 'price_per_unit') {
            setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({ ...prev, image_url: url }));
    };

    const handleLocationSelect = (location: { lat: number; lng: number }) => {
        setFormData((prev) => ({ ...prev, location }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        if (formData.quantity < 1) {
            setError('Quantity must be at least 1');
            return;
        }

        if (formData.price_per_unit <= 0) {
            setError('Price must be greater than 0');
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'plastic',
                bottle_size: '1 liter',
                quantity: 1,
                price_per_unit: 0,
                image_url: '',
                location: undefined,
                is_negotiable: true,
                contact_phone: '',
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPrice = formData.quantity * formData.price_per_unit;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-800">Sell Recyclables</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                        disabled={isSubmitting}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Clean Plastic Bottles - 1 Liter"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the condition and details of your recyclables..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                            required
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bottle Size (only for plastic/glass) */}
                    {(formData.category === 'plastic' || formData.category === 'glass') && (
                        <div>
                            <label htmlFor="bottle_size" className="block text-sm font-medium text-gray-700 mb-2">
                                Bottle Size
                            </label>
                            <select
                                id="bottle_size"
                                name="bottle_size"
                                value={formData.bottle_size || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                            >
                                {BOTTLE_SIZES.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity (pieces) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                                Price per Piece (₦) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="price_per_unit"
                                name="price_per_unit"
                                value={formData.price_per_unit}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Total Price Display */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="text-2xl font-bold text-green-700">₦{totalPrice.toFixed(2)}</p>
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            id="contact_phone"
                            name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleChange}
                            placeholder="e.g., +234 800 000 0000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Image
                        </label>
                        <ImageUploader
                            onImageUpload={handleImageUpload}
                            currentImage={formData.image_url}
                        />
                        {formData.image_url && (
                            <div className="mt-3">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location (Optional)
                        </label>
                        <LocationAutocomplete
                            value=""
                            onChange={(location) => handleLocationSelect({ lat: location.lat, lng: location.lng })}
                            placeholder="Enter your location..."
                        />
                    </div>

                    {/* Negotiable Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_negotiable"
                            name="is_negotiable"
                            checked={formData.is_negotiable}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="is_negotiable" className="ml-2 text-sm text-gray-700">
                            Price is negotiable
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecyclableModal;
