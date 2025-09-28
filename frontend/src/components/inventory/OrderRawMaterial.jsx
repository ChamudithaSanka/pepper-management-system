import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const OrderRawMaterial = ({ isOpen, onClose, material, onOrderSuccess }) => {
    const [orderData, setOrderData] = useState({
        quantity: '',
        deliveryDate: '',
        notes: '',
        farmerId: ''
    });
    const [eligibleFarmers, setEligibleFarmers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingFarmers, setFetchingFarmers] = useState(false);

    useEffect(() => {
        if (isOpen && material) {
            // Reset form when modal opens
            setOrderData({
                quantity: '',
                deliveryDate: '',
                notes: '',
                farmerId: ''
            });
            // Fetch all eligible farmers initially (without quantity filter)
            fetchEligibleFarmers();
        }
    }, [isOpen, material]);

    const fetchEligibleFarmers = async (quantity = null) => {
        if (!material) return;
        
        setFetchingFarmers(true);
        try {
            let url = `/api/rm-orders/eligible-farmers?materialType=${material.type}`;
            
            // Add quantity filter if provided
            if (quantity && parseFloat(quantity) > 0) {
                url += `&requestedQtyKg=${parseFloat(quantity)}`;
            }
            
            const response = await fetch(url, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Eligible farmers:', data.data);
                setEligibleFarmers(data.data || []);
            } else {
                console.error('Failed to fetch eligible farmers');
                setEligibleFarmers([]);
            }
        } catch (error) {
            console.error('Error fetching eligible farmers:', error);
            setEligibleFarmers([]);
        } finally {
            setFetchingFarmers(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));

        // Re-fetch eligible farmers when quantity changes
        if (name === 'quantity' && value && parseFloat(value) > 0) {
            fetchEligibleFarmers(value);
            // Reset selected farmer since capacity requirements changed
            setOrderData(prev => ({
                ...prev,
                [name]: value,
                farmerId: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderPayload = {
                rawMaterialType: material.type,
                requestedQtyKg: parseFloat(orderData.quantity),
                farmerId: orderData.farmerId,
                deliveryDate: orderData.deliveryDate,
                notes: orderData.notes
            };

            const response = await fetch('/api/rm-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Order created successfully:', result);
                onOrderSuccess?.();
                onClose();
            } else {
                const errorData = await response.json();
                console.error('Failed to create order:', errorData);
                alert('Failed to create order. Please try again.');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error creating order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDeliveryDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">
                            Order Raw Material
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Material Info */}
                {material && (
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-gray-900">{material.rawMaterialId}</h4>
                                <p className="text-sm text-gray-600">
                                    Current Stock: {material.quantityKg} kg • Type: {material.type}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity to Order (kg) *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="quantity"
                                value={orderData.quantity}
                                onChange={handleInputChange}
                                min="1"
                                step="0.1"
                                required
                                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter quantity in kg"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500 text-sm">kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Farmer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Farmer *
                        </label>
                        {fetchingFarmers ? (
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                    <span className="text-gray-500">Loading eligible farmers...</span>
                                </div>
                            </div>
                        ) : (
                            <select
                                name="farmerId"
                                value={orderData.farmerId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Choose a farmer</option>
                                {eligibleFarmers.map(farmer => (
                                    <option key={farmer._id} value={farmer._id}>
                                        {farmer.name} (Capacity: {farmer.capacity}kg {farmer.materialType})
                                    </option>
                                ))}
                            </select>
                        )}
                        {eligibleFarmers.length === 0 && !fetchingFarmers && (
                            <p className="text-sm text-gray-500 mt-1">
                                {orderData.quantity && parseFloat(orderData.quantity) > 0 
                                    ? `No farmers found with ${material?.type} capacity ≥ ${orderData.quantity}kg`
                                    : `No eligible farmers found for ${material?.type}`
                                }
                            </p>
                        )}
                    </div>

                    {/* Delivery Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Delivery Date *
                        </label>
                        <input
                            type="date"
                            name="deliveryDate"
                            value={orderData.deliveryDate}
                            onChange={handleInputChange}
                            min={getMinDeliveryDate()}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={orderData.notes}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Any special requirements or notes..."
                        />
                    </div>

                    {/* Order Summary */}
                    {orderData.quantity && orderData.farmerId && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-semibold text-green-800 mb-2">Order Summary</h5>
                            <div className="space-y-1 text-sm text-green-700">
                                <p><span className="font-medium">Material:</span> {material?.rawMaterialId} ({material?.type})</p>
                                <p><span className="font-medium">Quantity:</span> {orderData.quantity} kg</p>
                                <p><span className="font-medium">Farmer:</span> {eligibleFarmers.find(f => f._id === orderData.farmerId)?.name}</p>
                                {orderData.deliveryDate && (
                                    <p><span className="font-medium">Delivery:</span> {new Date(orderData.deliveryDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !orderData.quantity || !orderData.farmerId || !orderData.deliveryDate}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Placing Order...
                                </div>
                            ) : (
                                'Place Order'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default OrderRawMaterial;