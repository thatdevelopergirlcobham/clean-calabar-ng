import React from 'react';
import {
    ArrowLeftIcon,
    MapPinIcon,
    CalendarIcon,
    UserCircleIcon,
    CheckBadgeIcon,
    PhoneIcon,
    ShareIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { Recyclable } from '../../types/recyclable';

interface RecyclableDetailProps {
    recyclable: Recyclable;
    onBack: () => void;
}

const RecyclableDetail: React.FC<RecyclableDetailProps> = ({ recyclable, onBack }) => {
    const totalPrice = recyclable.total_price || recyclable.quantity * recyclable.price_per_unit;

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
        } catch {
            return dateStr;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'plastic': return 'bg-blue-100 text-blue-800';
            case 'glass': return 'bg-green-100 text-green-800';
            case 'metal': return 'bg-gray-100 text-gray-800';
            case 'paper': return 'bg-yellow-100 text-yellow-800';
            case 'cardboard': return 'bg-orange-100 text-orange-800';
            default: return 'bg-purple-100 text-purple-800';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            {/* Header / Back Button */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition font-medium"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Marketplace
                </button>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 transition rounded-full hover:bg-green-50">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-96 md:h-auto bg-gray-100">
                    <img
                        src={recyclable.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
                        alt={recyclable.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${getCategoryColor(recyclable.category)}`}>
                            {recyclable.category}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col h-full">
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {recyclable.title}
                            </h1>
                            <div className="text-right shrink-0">
                                <p className="text-3xl font-bold text-green-700">₦{totalPrice.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">
                                    ₦{recyclable.price_per_unit} / unit
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${recyclable.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {recyclable.status}
                            </span>
                            {recyclable.is_negotiable && (
                                <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase bg-yellow-100 text-yellow-800">
                                    Negotiable
                                </span>
                            )}
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(recyclable.created_at)}
                            </span>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed">
                            {recyclable.description || "No description provided."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
                                <CheckBadgeIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Quantity</p>
                                <p className="font-medium text-gray-900">{recyclable.quantity} units</p>
                            </div>
                        </div>

                        {recyclable.bottle_size && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                    <CheckBadgeIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Size</p>
                                    <p className="font-medium text-gray-900">{recyclable.bottle_size}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                <MapPinIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                                <p className="font-medium text-gray-900">
                                    {typeof recyclable.location === 'object' ? 'View on Map' : 'Available'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Seller Information</h3>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-200 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                                {recyclable.user_profiles?.avatar_url ? (
                                    <img
                                        src={recyclable.user_profiles.avatar_url}
                                        alt={recyclable.user_profiles.full_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                        <UserCircleIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">{recyclable.user_profiles?.full_name || 'Anonymous Seller'}</p>
                                    <p className="text-sm text-gray-500">Member since 2024</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {recyclable.contact_phone && (
                                    <a
                                        href={`tel:${recyclable.contact_phone}`}
                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
                                        title="Call Seller"
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                    </a>
                                )}
                                <button className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecyclableDetail;
