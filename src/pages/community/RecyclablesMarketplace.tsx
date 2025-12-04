import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getRecyclables, createRecyclable, subscribeToRecyclables } from '../../api/recyclables';
import RecyclableCard from '../../components/community/RecyclableCard';
import RecyclableModal from '../../components/community/RecyclableModal';
import type { Recyclable, CreateRecyclableInput, RecyclableCategory } from '../../types/recyclable';
import {
    FunnelIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const RecyclablesMarketplace: React.FC = () => {
    const { user } = useAuth();
    const [recyclables, setRecyclables] = useState<Recyclable[]>([]);
    const [filteredRecyclables, setFilteredRecyclables] = useState<Recyclable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [reloadTick, setReloadTick] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<RecyclableCategory | ''>('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Fetch recyclables
    const fetchRecyclables = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getRecyclables();
            setRecyclables(data);
        } catch (err) {
            console.error('Failed to load recyclables:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecyclables();

        // Subscribe to real-time updates
        const subscription = subscribeToRecyclables(() => {
            fetchRecyclables();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchRecyclables, reloadTick]);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...recyclables];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (r) =>
                    r.title.toLowerCase().includes(term) ||
                    r.description?.toLowerCase().includes(term) ||
                    r.category.toLowerCase().includes(term) ||
                    r.bottle_size?.toLowerCase().includes(term)
            );
        }

        // Filter by category
        if (categoryFilter) {
            result = result.filter((r) => r.category === categoryFilter);
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter((r) => r.status === statusFilter);
        }

        // Sorting
        switch (sortBy) {
            case 'oldest':
                result.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                break;
            case 'price_low':
                result.sort((a, b) => a.price_per_unit - b.price_per_unit);
                break;
            case 'price_high':
                result.sort((a, b) => b.price_per_unit - a.price_per_unit);
                break;
            case 'quantity':
                result.sort((a, b) => b.quantity - a.quantity);
                break;
            default:
                result.sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
        }

        setFilteredRecyclables(result);
    }, [recyclables, searchTerm, categoryFilter, statusFilter, sortBy]);

    // Handle create listing
    const handleCreateListing = async (data: CreateRecyclableInput) => {
        if (!user) {
            window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        await createRecyclable(user.id, data);
        setShowModal(false);
        fetchRecyclables();
    };

    // Statistics
    const stats = {
        total: recyclables.length,
        available: recyclables.filter((r) => r.status === 'available').length,
        totalValue: recyclables
            .filter((r) => r.status === 'available')
            .reduce((sum, r) => sum + (r.total_price || r.quantity * r.price_per_unit), 0),
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-[#0d542b] text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <SparklesIcon className="w-10 h-10" />
                        <h1 className="text-4xl md:text-5xl font-bold">Recyclables Marketplace</h1>
                    </div>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90">
                        Turn your recyclables into cash! Buy and sell plastic bottles, glass, metal, and more.
                        Help the environment while earning money.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Sell Recyclables
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-gray-600 text-sm mb-1">Total Listings</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-gray-600 text-sm mb-1">Available Now</p>
                        <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-gray-600 text-sm mb-1">Total Value</p>
                        <p className="text-3xl font-bold text-gray-800">₦{stats.totalValue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search recyclables..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as RecyclableCategory | '')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="plastic">Plastic</option>
                            <option value="glass">Glass</option>
                            <option value="metal">Metal</option>
                            <option value="paper">Paper</option>
                            <option value="cardboard">Cardboard</option>
                            <option value="other">Other</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="reserved">Reserved</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="quantity">Quantity: High to Low</option>
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={() => setReloadTick((t) => t + 1)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
                        <p className="text-gray-600">Loading recyclables...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                        <strong className="font-bold">Error:</strong>{' '}
                        <span>{error.message || 'Failed to load recyclables'}</span>
                    </div>
                ) : filteredRecyclables.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                            <FunnelIcon />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No recyclables found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || categoryFilter || statusFilter
                                ? 'Try adjusting your filters'
                                : 'Be the first to list recyclables for sale!'}
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Create First Listing
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRecyclables.map((recyclable) => (
                            <RecyclableCard key={recyclable.id} recyclable={recyclable} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <RecyclableModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleCreateListing}
                />
            )}
        </div>
    );
};

export default RecyclablesMarketplace;
