import React, { useState, useEffect } from 'react';

const InventoryHistory = () => {
    const [inventoryHistory, setInventoryHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventoryHistory();
    }, []);

    const fetchInventoryHistory = async () => {
        setLoading(true);
        try {
            // In development/testing, just use mock data directly
            // In production, this would be replaced with actual API call
            const mockData = generateMockInventoryHistory();
            setInventoryHistory(mockData);
            setError('');
            
            // Keep this commented for now until the API is ready
            /*
            const response = await fetch('/api/inventory-history');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory history');
            }
            const data = await response.json();
            setInventoryHistory(data);
            setError('');
            */
        } catch (err) {
            console.error('Error fetching inventory history:', err);
            // Even if there's an error, we'll still show mock data
            const mockData = generateMockInventoryHistory();
            setInventoryHistory(mockData);
            // Don't set error message so the UI will show the mock data
            setError('');
        } finally {
            setLoading(false);
        }
    };

    // Generate mock data for demonstration
    const generateMockInventoryHistory = () => {
        const mockProducts = [
            { id: 'PID-001', name: 'Premium Black Pepper Powder' },
            { id: 'PID-002', name: 'Premium Green Whole Peppercorns' },
            { id: 'PID-003', name: 'Black Pepper Sauce' },
            { id: 'PID-004', name: 'Organic Ceylon Whole Black Peppercorns' },
            { id: 'PID-005', name: 'Black Pepper Essential Oil' },
        ];

        const changeTypes = ['Added', 'Removed', 'Sold', 'Updated'];
        
        return Array.from({ length: 20 }, (_, i) => {
            const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
            const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
            const prevStock = Math.floor(Math.random() * 200);
            const changeAmount = Math.floor(Math.random() * 50);
            const newStock = changeType === 'Added' || changeType === 'Updated' 
                ? prevStock + changeAmount 
                : Math.max(0, prevStock - changeAmount);
            
            return {
                _id: `hist-${i}`,
                inventoryId: `inv-${i}`,
                productId: product.id,
                productName: product.name,
                changeType,
                changeAmount,
                previousStock: prevStock,
                newStock,
                safetyStock: Math.floor(Math.random() * 30) + 10,
                reorderLevel: Math.floor(Math.random() * 20) + 5,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString()
            };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this history record?')) {
            try {
                // In production, this would make an API call
                // await fetch(`/api/inventory-history/${id}`, { method: 'DELETE' });
                setInventoryHistory(inventoryHistory.filter(item => item._id !== id));
            } catch (err) {
                console.error('Error deleting inventory history:', err);
                alert('Failed to delete inventory history record');
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
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory History</h1>
                <p className="text-gray-600">Track all changes to your inventory items</p>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 flex-grow">
                    <div className="w-full md:w-1/3">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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

            {/* Inventory History Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                    </div>
                ) : error && !inventoryHistory.length ? (
                    <div className="text-center p-8 text-red-500">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safety Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Re-Order Level</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No inventory history records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                        <div className="text-xs text-gray-500">ID: {item.productId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getChangeTypeStyle(item.changeType)}`}>
                                                    {item.changeType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.changeAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.previousStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.newStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.safetyStock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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