import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import OrderRawMaterial from './OrderRawMaterial';

const RawMaterialManagement = () => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
    const [showEditMaterialForm, setShowEditMaterialForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [newMaterial, setNewMaterial] = useState({
        type: '',
        quantity: '',
        reorderLevel: ''
    });
    const [editMaterial, setEditMaterial] = useState({
        type: '',
        quantity: '',
        reorderLevel: ''
    });
    const [error, setError] = useState('');
    const [editError, setEditError] = useState('');

    useEffect(() => {
        fetchRawMaterials();
    }, []);

    const fetchRawMaterials = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/raw-materials', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setRawMaterials(data.data || []);
            } else {
                console.error('Failed to fetch raw materials');
            }
        } catch (error) {
            console.error('Error fetching raw materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (material) => {
        if (material.lowStockStatus === 'LowStock') return { status: 'Low Stock', color: 'text-red-600 bg-red-100' };
        return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const handleOrderClick = (material) => {
        setSelectedMaterial(material);
        setShowOrderModal(true);
    };

    const handleEditClick = (material) => {
        setEditingMaterial(material);
        setEditMaterial({
            type: material.type,
            quantity: material.quantityKg.toString(),
            reorderLevel: material.reorderLevelKg.toString()
        });
        setEditError(''); // Clear any previous errors
        setShowEditMaterialForm(true);
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Frontend validation
        const errors = [];

        if (!newMaterial.type.trim()) {
            errors.push('Material type is required');
        }

        if (!newMaterial.quantity || parseFloat(newMaterial.quantity) <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (!newMaterial.reorderLevel || parseFloat(newMaterial.reorderLevel) < 0) {
            errors.push('Reorder level must be 0 or greater');
        }

        if (errors.length > 0) {
            setError(errors.join('. '));
            setLoading(false);
            return;
        }

        try {
            const payload = {
                type: newMaterial.type.trim(),
                quantityKg: parseFloat(newMaterial.quantity),
                reorderLevelKg: parseFloat(newMaterial.reorderLevel)
            };

            const response = await fetch('/api/raw-materials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNewMaterial({
                    type: '',
                    quantity: '',
                    reorderLevel: ''
                });
                setShowAddMaterialForm(false);
                fetchRawMaterials();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to add raw material');
            }
        } catch (error) {
            console.error('Error adding raw material:', error);
            setError('Error adding raw material');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMaterial = async (e) => {
        e.preventDefault();
        setLoading(true);
        setEditError('');

        // Frontend validation
        const errors = [];

        if (!editMaterial.type.trim()) {
            errors.push('Material type is required');
        }

        if (!editMaterial.quantity || parseFloat(editMaterial.quantity) <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (!editMaterial.reorderLevel || parseFloat(editMaterial.reorderLevel) < 0) {
            errors.push('Reorder level must be 0 or greater');
        }

        if (errors.length > 0) {
            setEditError(errors.join('. '));
            setLoading(false);
            return;
        }

        try {
            const payload = {
                type: editMaterial.type.trim(),
                quantityKg: parseFloat(editMaterial.quantity),
                reorderLevelKg: parseFloat(editMaterial.reorderLevel)
            };

            const response = await fetch(`/api/raw-materials/${editingMaterial._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setEditMaterial({
                    type: '',
                    quantity: '',
                    reorderLevel: ''
                });
                setShowEditMaterialForm(false);
                setEditingMaterial(null);
                fetchRawMaterials();
            } else {
                const data = await response.json();
                setEditError(data.message || 'Failed to update raw material');
            }
        } catch (error) {
            console.error('Error updating raw material:', error);
            setEditError('Error updating raw material');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Raw Materials Management</h2>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="text-center text-gray-500 mt-2">Loading raw materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Raw Materials Management</h2>
                    <p className="text-gray-600 mt-1">Monitor stock levels and place orders</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowAddMaterialForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Add Raw Material
                    </button>
                    <button
                        onClick={fetchRawMaterials}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Refresh Stock
                    </button>
                </div>
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
                    <h3 className="text-sm font-medium text-gray-500">
                        Total Materials
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">{rawMaterials.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                    <p className="text-2xl font-bold text-red-600">
                        {rawMaterials.filter(material => material.lowStockStatus === 'LowStock').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {rawMaterials.filter(material => material.lowStockStatus === 'InStock').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Stock (kg)</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {rawMaterials.reduce((total, material) => total + (material.quantityKg || 0), 0).toFixed(1)}
                    </p>
                </div>
            </div>

            {/* Raw Materials Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Raw Material Inventory</h3>
                </div>
                
                {rawMaterials.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Raw Materials Found</h3>
                        <p className="text-gray-500 mb-4">Start by adding raw materials to your inventory</p>
                        <button
                            onClick={() => setShowAddMaterialForm(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            + Add Your First Raw Material
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Material ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity (kg)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reorder Level (kg)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rawMaterials.map((material) => {
                                    const stockInfo = getStockStatus(material);
                                    return (
                                        <tr key={material._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {material.rawMaterialId}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {material.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {material.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {material.quantityKg}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {material.reorderLevelKg}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.color}`}>
                                                    {stockInfo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(material.updatedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleOrderClick(material)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Order
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button 
                                                        onClick={() => handleEditClick(material)}
                                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Low Stock Alert Section */}
            {rawMaterials.filter(m => m.lowStockStatus === 'LowStock').length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-red-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h3>
                            <p className="text-yellow-700 mt-1">
                                {rawMaterials.filter(m => m.lowStockStatus === 'LowStock').length} materials need restocking
                            </p>
                            <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                    {rawMaterials
                                        .filter(m => m.lowStockStatus === 'LowStock')
                                        .map(material => (
                                            <button
                                                key={material._id}
                                                onClick={() => handleOrderClick(material)}
                                                className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-full text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                                            >
                                                Order {material.type} ({material.quantityKg}kg)
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Raw Material Modal */}
            {showAddMaterialForm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Add New Raw Material</h3>
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material Type *
                                </label>
                                <select
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Material Type</option>
                                    <option value="Green Pepper">Green Pepper</option>
                                    <option value="Black Pepper">Black Pepper</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Quantity (kg) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter quantity in kg"
                                    value={newMaterial.quantity}
                                    onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                                    min="0"
                                    step="0.1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reorder Level (kg) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Minimum stock level to trigger reorder"
                                    value={newMaterial.reorderLevel}
                                    onChange={(e) => setNewMaterial({...newMaterial, reorderLevel: e.target.value})}
                                    min="0"
                                    step="0.1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Alert will show when stock falls below this level
                                </p>
                            </div>
                            
                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                                    {error}
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    {loading ? 'Adding...' : 'Add Material'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMaterialForm(false);
                                        setError('');
                                        setNewMaterial({
                                            type: '',
                                            quantity: '',
                                            reorderLevel: ''
                                        });
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Raw Material Modal */}
            {showEditMaterialForm && editingMaterial && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Edit Raw Material</h3>
                        <form onSubmit={handleEditMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material Type *
                                </label>
                                <select
                                    value={editMaterial.type}
                                    onChange={(e) => setEditMaterial({...editMaterial, type: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Material Type</option>
                                    <option value="Green Pepper">Green Pepper</option>
                                    <option value="Black Pepper">Black Pepper</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Quantity (kg) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter quantity in kg"
                                    value={editMaterial.quantity}
                                    onChange={(e) => setEditMaterial({...editMaterial, quantity: e.target.value})}
                                    min="0"
                                    step="0.1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reorder Level (kg) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Minimum stock level to trigger reorder"
                                    value={editMaterial.reorderLevel}
                                    onChange={(e) => setEditMaterial({...editMaterial, reorderLevel: e.target.value})}
                                    min="0"
                                    step="0.1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Alert will show when stock falls below this level
                                </p>
                            </div>
                            
                            {editError && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                                    {editError}
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    {loading ? 'Updating...' : 'Update Material'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditMaterialForm(false);
                                        setEditingMaterial(null);
                                        setEditError('');
                                        setEditMaterial({
                                            type: '',
                                            quantity: '',
                                            reorderLevel: ''
                                        });
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Order Modal */}
            <OrderRawMaterial
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                material={selectedMaterial}
                onOrderSuccess={() => {
                    fetchRawMaterials(); // Refresh the data after successful order
                    setShowOrderModal(false);
                    setSelectedMaterial(null);
                }}
            />
        </div>
    );
};

export default RawMaterialManagement;