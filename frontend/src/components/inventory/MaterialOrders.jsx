import React, { useState, useEffect } from 'react';

const MaterialOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rm-orders', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setOrders(data.data || []);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const markAsDelivered = async (rmOrderId, requestedQty) => {
        try {
            const deliveredQty = prompt(`Enter delivered quantity (requested: ${requestedQty} kg):`);
            if (!deliveredQty || isNaN(deliveredQty) || parseFloat(deliveredQty) <= 0) {
                alert('Please enter a valid quantity');
                return;
            }

            if (parseFloat(deliveredQty) > parseFloat(requestedQty)) {
                alert('Delivered quantity cannot exceed requested quantity');
                return;
            }

            const response = await fetch(`/api/rm-orders/${rmOrderId}/deliver`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    deliveredQtyKg: parseFloat(deliveredQty)
                })
            });

            if (response.ok) {
                const result = await response.json();
                fetchOrders(); // Refresh the orders list
                
                // Show detailed success message with inventory update info
                if (result.inventoryUpdated) {
                    alert(`Order marked as delivered successfully!\n\n` +
                          `Inventory Updated:\n` +
                          `• Material: ${result.inventoryUpdated.materialType}\n` +
                          `• Added: ${result.inventoryUpdated.addedQuantity} kg\n` +
                          `• New Total: ${result.inventoryUpdated.newQuantity} kg\n\n` +
                          `Note: Visit the Raw Materials section to see updated inventory.`);
                } else {
                    alert('Order marked as delivered successfully');
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to mark order as delivered');
            }
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            alert('Error marking order as delivered');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const filteredOrders = orders.filter(order => 
        filterStatus === 'all' || order.status === filterStatus
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Material Orders</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="text-center text-gray-500 mt-2">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Material Orders</h2>
                    <p className="text-gray-600 mt-1">Track raw material orders and deliveries</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <button 
                        onClick={() => setError('')}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(order => order.status === 'Pending').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {orders.filter(order => order.status === 'Delivered').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {orders.reduce((total, order) => total + (order.requestedQtyKg || 0), 0).toFixed(1)} kg
                    </p>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === 'all' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    All Orders
                </button>
                <button
                    onClick={() => setFilterStatus('Pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === 'Pending' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilterStatus('Delivered')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === 'Delivered' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Delivered
                </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Raw Material Orders</h3>
                </div>
                
                {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 012 2v6.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v3.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v4.5a.5.5 0 001 0V5a2 2 0 00-2-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" clipRule="evenodd"/>
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                        <p className="text-gray-500">
                            {filterStatus === 'all' 
                                ? 'No raw material orders have been placed yet'
                                : `No ${filterStatus.toLowerCase()} orders found`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Material Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Farmer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested Qty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Delivered Qty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.rmOrderId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 012 2v6.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v3.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v4.5a.5.5 0 001 0V5a2 2 0 00-2-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" clipRule="evenodd"/>
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.rmOrderId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {order.rawMaterialType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.farmerName || 'Unknown Farmer'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.requestedQtyKg} kg
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.deliveredQtyKg} kg
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {order.status === 'Pending' && (
                                                    <button 
                                                        onClick={() => markAsDelivered(order.rmOrderId, order.requestedQtyKg)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Mark Delivered
                                                    </button>
                                                )}
                                                <button className="text-blue-600 hover:text-blue-900 font-medium">
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialOrders;