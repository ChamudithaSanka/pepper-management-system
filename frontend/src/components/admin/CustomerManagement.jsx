import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GoogleMapSelector from '../GoogleMapSelector';

const CustomerManagement = ({ onStatsUpdate }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        deliveryAddress: {
            latitude: null,
            longitude: null,
            address: ''
        }
    });
    const [showMapSelector, setShowMapSelector] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Validation helper function
    const validateField = (field, value) => {
        const errors = { ...fieldErrors };
        
        switch (field) {
            case 'email':
                if (!value.trim()) {
                    errors.email = 'Email is required';
                } else if (!/^\S+@\S+\.\S+$/.test(value.trim())) {
                    errors.email = 'Please enter a valid email address';
                } else {
                    delete errors.email;
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    errors.phone = 'Phone number is required';
                } else if (!/^[0-9]{8,15}$/.test(value.trim())) {
                    errors.phone = 'Enter valid phone number (8-15 digits)';
                } else {
                    delete errors.phone;
                }
                break;
            case 'name':
                if (!value.trim()) {
                    errors.name = 'Name is required';
                } else if (value.length > 100) {
                    errors.name = 'Name cannot exceed 100 characters';
                } else {
                    delete errors.name;
                }
                break;
            case 'password':
                if (!value.trim()) {
                    errors.password = 'Password is required';
                } else if (value.length < 6) {
                    errors.password = 'Password must be at least 6 characters';
                } else {
                    delete errors.password;
                }
                break;
            default:
                break;
        }
        
        setFieldErrors(errors);
    };

    const handleLocationSelect = (location) => {
        setNewItem({
            ...newItem,
            deliveryAddress: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address
            }
        });
        setShowMapSelector(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/customers', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.data || []);
                if (onStatsUpdate) onStatsUpdate();
            } else {
                setError('Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Error fetching customers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (customerId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchCustomers();
            } else {
                setError('Failed to update customer status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Error updating status');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Frontend validation
        const errors = [];

        // Name validation
        if (!newItem.name.trim()) {
            errors.push('Name is required');
        } else if (newItem.name.length > 100) {
            errors.push('Name cannot exceed 100 characters');
        }

        // Email validation
        if (!newItem.email.trim()) {
            errors.push('Email is required');
        } else if (!/^\S+@\S+\.\S+$/.test(newItem.email.trim())) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (!newItem.password.trim()) {
            errors.push('Password is required');
        } else if (newItem.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        // Phone validation
        if (!newItem.phone.trim()) {
            errors.push('Phone number is required');
        } else if (!/^[0-9]{8,15}$/.test(newItem.phone.trim())) {
            errors.push('Please enter a valid phone number (8-15 digits)');
        }

        // Delivery address validation
        if (!newItem.deliveryAddress.latitude || !newItem.deliveryAddress.longitude || !newItem.deliveryAddress.address) {
            errors.push('Please select a delivery address on the map');
        }

        // If there are validation errors, show them and stop
        if (errors.length > 0) {
            setError(errors.join('. '));
            setLoading(false);
            return;
        }

        try {
            const payload = { 
                name: newItem.name, 
                email: newItem.email, 
                password: newItem.password, 
                phone: newItem.phone,
                deliveryAddress: {
                    latitude: Number(newItem.deliveryAddress.latitude),
                    longitude: Number(newItem.deliveryAddress.longitude),
                    address: newItem.deliveryAddress.address
                }
            };

            console.log('Sending customer data:', payload);

            const response = await fetch('/api/customers/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNewItem({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    deliveryAddress: {
                        latitude: null,
                        longitude: null,
                        address: ''
                    }
                });
                setFieldErrors({});
                setShowAddForm(false);
                fetchCustomers();
            } else {
                const data = await response.json();
                console.log('Error response:', data);
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors.join(', '));
                } else {
                    setError(data.message || 'Failed to add customer');
                }
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('Error adding customer');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (customerId, updatedData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditingItem(null);
                fetchCustomers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update customer');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            setError('Error updating customer');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (customerId) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchCustomers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            setError('Error deleting customer');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.deliveryAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="space-y-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Add Customer
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500 placeholder-green-700"
                        onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                    />
                </div>
                <button
                    onClick={fetchCustomers}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
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
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-green-700">Total Customers</h3>
                    <p className="text-2xl font-bold text-green-900">{filteredCustomers.length}</p>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-blue-700">Active</h3>
                    <p className="text-2xl font-bold text-blue-900">
                        {filteredCustomers.filter(item => item.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-yellow-700">Inactive</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                        {filteredCustomers.filter(item => item.status === 'Inactive').length}
                    </p>
                </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Add New Customer</h3>
                        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={newItem.name}
                                    onChange={(e) => {
                                        setNewItem({...newItem, name: e.target.value});
                                        validateField('name', e.target.value);
                                    }}
                                    className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                                        fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
                            </div>
                            
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newItem.email}
                                    onChange={(e) => {
                                        setNewItem({...newItem, email: e.target.value});
                                        validateField('email', e.target.value);
                                    }}
                                    className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
                            </div>
                            
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password (min 6 characters)"
                                    value={newItem.password}
                                    onChange={(e) => {
                                        setNewItem({...newItem, password: e.target.value});
                                        validateField('password', e.target.value);
                                    }}
                                    className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                                        fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
                            </div>
                            
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={newItem.phone}
                                    onChange={(e) => {
                                        setNewItem({...newItem, phone: e.target.value});
                                        validateField('phone', e.target.value);
                                    }}
                                    className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {fieldErrors.phone && <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>}
                            </div>
                            
                            <div className="col-span-2">
                                <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50">
                                    <div className="text-sm text-gray-600 mb-2">Delivery Address</div>
                                    {newItem.deliveryAddress.address ? (
                                        <div className="text-sm text-green-700 mb-2">{newItem.deliveryAddress.address}</div>
                                    ) : (
                                        <div className="text-sm text-gray-400 mb-2">No address selected</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowMapSelector(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        {newItem.deliveryAddress.address ? 'Change Location' : 'Select on Map'}
                                    </button>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="col-span-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                                    {error}
                                </div>
                            )}
                            
                            <div className="col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    {loading ? 'Adding...' : 'Add Customer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setFieldErrors({});
                                        setError('');
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Customers Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading customers...</div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400">
                            {searchTerm 
                                ? 'No customers found matching your search.' 
                                : 'No customers found.'
                            }
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Customer ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Registered</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer, idx) => (
                                    <tr key={customer._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {customer.customerId}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.name}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.email}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.phone}
                                        </td>
                                        <td className="px-2 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {customer.deliveryAddress?.address 
                                                || customer.deliveryAddress?.fullAddress 
                                                || [customer.deliveryAddress?.street, customer.deliveryAddress?.city, customer.deliveryAddress?.zipCode]
                                                    .filter(Boolean)
                                                    .join(', ') 
                                                || 'No address'}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleStatusToggle(customer.customerId, customer.status)}
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                                                    customer.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {customer.status}
                                            </button>
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.totalOrders || 0}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(customer.registrationDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditingItem(customer)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.customerId)}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">
                            Edit Customer
                        </h3>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingItem.customerId, editingItem);
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={editingItem.email}
                                onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={editingItem.phone}
                                onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <textarea
                                placeholder="Delivery Address"
                                value={editingItem.deliveryAddress?.address || ''}
                                onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    deliveryAddress: {
                                        ...(editingItem.deliveryAddress || {}),
                                        address: e.target.value
                                    }
                                })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows="3"
                                required
                            />
                            <select
                                value={editingItem.status}
                                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Google Maps Location Selector Modal */}
            {showMapSelector && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                    <div className="bg-white rounded-lg p-4 w-[90%] max-w-4xl h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Select Delivery Location</h3>
                            <button
                                onClick={() => setShowMapSelector(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1">
                            <GoogleMapSelector onLocationSelect={handleLocationSelect} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CustomerManagement;