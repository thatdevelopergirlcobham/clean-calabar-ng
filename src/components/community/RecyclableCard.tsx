import React from 'react';
import { Link } from 'react-router-dom';
import {
    MapPinIcon,
    CalendarIcon,
    UserCircleIcon,
    CurrencyDollarIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { Recyclable } from '../../types/recyclable';

interface RecyclableCardProps {
    recyclable: Recyclable;
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'plastic':
            return 'bg-blue-100 text-blue-800';
        case 'glass':
            return 'bg-green-100 text-green-800';
        case 'metal':
            return 'bg-gray-100 text-gray-800';
        case 'paper':
            return 'bg-yellow-100 text-yellow-800';
        case 'cardboard':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-purple-100 text-purple-800';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available':
            return 'bg-green-100 text-green-800';
        case 'sold':
            return 'bg-gray-100 text-gray-800';
        case 'reserved':
            return 'bg-yellow-100 text-yellow-800';
        case 'removed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatDate = (dateStr: string) => {
    try {
        return format(new Date(dateStr), 'd MMM yyyy, h:mm a');
    } catch {
        return dateStr;
    }
};

const RecyclableCard: React.FC<RecyclableCardProps> = ({ recyclable }) => {
    const totalPrice = recyclable.total_price || recyclable.quantity * recyclable.price_per_unit;

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={recyclable.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={recyclable.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ background: '#e5e7eb' }}
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                            recyclable.status
                        )}`}
                    >
                        {recyclable.status}
                    </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(
                            recyclable.category
                        )}`}
                    >
                        {recyclable.category}
                    </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-white text-sm opacity-90">Total Price</p>
                            <p className="text-white text-2xl font-bold">₦{totalPrice.toFixed(2)}</p>
                        </div>
                        {recyclable.is_negotiable && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                                Negotiable
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Title */}
                <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition">
                    {recyclable.title}
                </h3>

                {/* Description */}
                {recyclable.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recyclable.description}</p>
                )}

                {/* Details Grid */}
                <div className="space-y-2 mb-4">
                    {/* Quantity and Price per Unit */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span>₦{recyclable.price_per_unit.toFixed(2)} per piece</span>
                        </div>
                        <div className="font-semibold text-green-700">
                            {recyclable.quantity} pieces
                        </div>
                    </div>

                    {/* Bottle Size (if applicable) */}
                    {recyclable.bottle_size && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckBadgeIcon className="w-4 h-4 text-gray-400" />
                            <span>Size: {recyclable.bottle_size}</span>
                        </div>
                    )}

                    {/* Seller */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        <span>
                            {recyclable.user_profiles?.full_name || 'Seller'}
                        </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(recyclable.created_at)}</span>
                    </div>

                    {/* Location (if available) */}
                    {recyclable.location && typeof recyclable.location === 'object' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span>Location available</span>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                {recyclable.contact_phone && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                        <p className="text-sm font-semibold text-gray-800">{recyclable.contact_phone}</p>
                    </div>
                )}

                {/* View Details Button */}
                <Link
                    to={`/recyclables/${recyclable.id}`}
                    className="block w-full text-center py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default RecyclableCard;
