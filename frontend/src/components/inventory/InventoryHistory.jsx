import React, { useState, useEffect } from 'react';

const InventoryHistory = () => {
    const [inventoryHistory, setInventoryHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        added: 0,
        removed: 0,
        sold: 0,
        updated: 0
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchInventoryHistory();
    }, []);
    
    useEffect(() => {
        // Fetch real counts from API for stat cards
        fetchInventoryHistoryCounts();
    }, []);
    
    const fetchInventoryHistoryCounts = async () => {
        try {
            const response = await fetch('/api/inventory-history/counts');
            
            if (!response.ok) {
                throw new Error('Failed to fetch inventory history counts');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                setStats({
                    added: result.data.Added || 0,
                    removed: result.data.Removed || 0, 
                    sold: result.data.Sold || 0,
                    updated: result.data.Updated || 0
                });
            }
        } catch (error) {
            console.error('Error fetching inventory history counts:', error);
            // Reset stats to zero instead of using mock data
            setStats({
                added: 0,
                removed: 0,
                sold: 0,
                updated: 0
            });
        }
    };
    
    // Calculate stats from current data if needed
    const calculateStatsFromCurrentData = () => {
        const added = inventoryHistory.filter(item => item.changeType === 'Added').length;
        const removed = inventoryHistory.filter(item => item.changeType === 'Removed').length;
        const sold = inventoryHistory.filter(item => item.changeType === 'Sold').length;
        const updated = inventoryHistory.filter(item => item.changeType === 'Updated').length;
        
        setStats({
            added,
            removed,
            sold,
            updated
        });
    };

    const fetchInventoryHistory = async (filterChangeType = null) => {
        setLoading(true);
        try {
            // Fetch real data from the API
            let url = '/api/inventory-history';
            if (filterChangeType && filterChangeType !== 'all') {
                url += `?changeType=${filterChangeType}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch inventory history');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                setInventoryHistory(result.data);
                // Always update filter status to match what was requested
                setFilterStatus(filterChangeType === null ? 'all' : filterChangeType);
            } else {
                throw new Error(result.error || 'Failed to load data');
            }
            
            setError('');
        } catch (err) {
            console.error('Error fetching inventory history:', err);
            // Show error to user
            setError(`Error: ${err.message}`);
            // Clear inventory history to avoid showing stale data
            setInventoryHistory([]);
        } finally {
            setLoading(false);
        }
    };
    // No mock data generation - using real API data only

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this history record?')) {
            try {
                const response = await fetch(`/api/inventory-history/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete history record');
                }
                
                // Parse response and show success message
                const result = await response.json();
                setSuccessMessage(result.message || 'Record deleted successfully');
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
                
                // Refresh the data after deletion
                fetchInventoryHistory(filterStatus !== 'all' ? filterStatus : null);
                fetchInventoryHistoryCounts();
            } catch (err) {
                console.error('Error deleting inventory history:', err);
                setError('Failed to delete inventory history record: ' + err.message);
                
                // Hide error message after 3 seconds
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        }
    };

    // Filter history entries based on selected filter and search term
    const filteredHistory = inventoryHistory.filter(item => {
        // First, apply status filter
        if (filterStatus !== 'all' && item.changeType !== filterStatus) {
            return false;
        }
        
        // Then, apply search term filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.productName.toLowerCase().includes(searchLower) ||
                item.productId.toLowerCase().includes(searchLower)
            );
        }
        
        return true;
    });

    // Format date
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Get style for change type badge
    const getChangeTypeStyle = (changeType) => {
        switch (changeType) {
            case 'Added':
                return 'bg-green-100 text-green-800';
            case 'Removed':
                return 'bg-red-100 text-red-800';
            case 'Sold':
                return 'bg-blue-100 text-blue-800';
            case 'Updated':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function removed as stock status is no longer displayed

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory History</h1>
                <p className="text-gray-600">Track all changes to your inventory items</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Added Products Card */}
                <div 
                    className="bg-green-50 border-t border-r border-b border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-green-500 cursor-pointer"
                    onClick={() => fetchInventoryHistory('Added')}
                >
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Added Products</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.added}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Removed Products Card */}
                <div 
                    className="bg-red-50 border-t border-r border-b border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-red-500 cursor-pointer"
                    onClick={() => fetchInventoryHistory('Removed')}
                >
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Removed Products</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.removed}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Sold Products Card */}
                <div 
                    className="bg-blue-50 border-t border-r border-b border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-blue-500 cursor-pointer"
                    onClick={() => fetchInventoryHistory('Sold')}
                >
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Sold Products</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.sold}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 flex-grow">
                    <div className="w-full md:w-1/3">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={filterStatus}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                fetchInventoryHistory(selectedValue);
                            }}
                        >
                            <option value="all">All Change Types</option>
                            <option value="Added">Added</option>
                            <option value="Removed">Removed</option>
                            <option value="Sold">Sold</option>
                            <option value="Updated">Updated</option>
                        </select>
                    </div>

                    <div className="flex-grow">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by product name or ID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            )}
            
            {/* Inventory History Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                    </div>
                ) : !inventoryHistory.length ? (
                    <div className="text-center p-8 text-gray-500">No inventory history records found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Change Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Change Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Previous Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">New Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Safety Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Re-Order Level</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No inventory history records found. Please add or update products to see their history.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, idx) => (
                                        <tr key={item._id} className={`hover:bg-green-100 ${idx % 2 === 0 ? 'bg-green-50' : 'bg-white'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{item.productName}</div>
                                                        <div className="text-xs text-gray-500">ID: {item.productId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getChangeTypeStyle(item.changeType)}`}>
                                                    {item.changeType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.changeAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.previousStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.newStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.safetyStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.reorderLevel}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors duration-200"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryHistory;