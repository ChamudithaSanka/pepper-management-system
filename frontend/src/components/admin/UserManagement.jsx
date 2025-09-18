import React, { useState, useEffect } from 'react';

const UserManagement = ({ onStatsUpdate }) => {
    const [activeTab, setActiveTab] = useState('staff');
    const [staffUsers, setStaffUsers] = useState([]);
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
        role: 'Finance Manager', // default for staff
        phone: '', // for customers
        deliveryAddress: '' // for customers
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'staff') {
                await fetchStaffUsers();
            } else {
                await fetchCustomers();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setStaffUsers(data.data || []);
                if (onStatsUpdate) onStatsUpdate();
            } else {
                setError('Failed to fetch staff users');
            }
        } catch (error) {
            console.error('Error fetching staff users:', error);
            setError('Error fetching staff users');
        }
    };

    const fetchCustomers = async () => {
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
        }
    };

    const handleStatusToggle = async (userId, currentStatus, userType) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        try {
            const endpoint = userType === 'staff' ? `/api/users/${userId}` : `/api/customers/${userId}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Refresh data
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Error updating status');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = activeTab === 'staff' ? '/api/users/register' : '/api/customers/register';
            const payload = activeTab === 'staff' 
                ? { name: newItem.name, email: newItem.email, password: newItem.password, role: newItem.role }
                : { name: newItem.name, email: newItem.email, password: newItem.password, phone: newItem.phone, deliveryAddress: newItem.deliveryAddress };

            const response = await fetch(endpoint, {
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
                    role: 'Finance Manager',
                    phone: '',
                    deliveryAddress: ''
                });
                setShowAddForm(false);
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || `Failed to add ${activeTab === 'staff' ? 'user' : 'customer'}`);
            }
        } catch (error) {
            console.error('Error adding item:', error);
            setError(`Error adding ${activeTab === 'staff' ? 'user' : 'customer'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (itemId, updatedData) => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'staff' ? `/api/users/${itemId}` : `/api/customers/${itemId}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditingItem(null);
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || `Failed to update ${activeTab === 'staff' ? 'user' : 'customer'}`);
            }
        } catch (error) {
            console.error('Error updating item:', error);
            setError(`Error updating ${activeTab === 'staff' ? 'user' : 'customer'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'staff' ? 'user' : 'customer'}?`)) {
            return;
        }

        setLoading(true);
        try {
            const endpoint = activeTab === 'staff' ? `/api/users/${itemId}` : `/api/customers/${itemId}`;
            const response = await fetch(endpoint, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                setError(data.message || `Failed to delete ${activeTab === 'staff' ? 'user' : 'customer'}`);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(`Error deleting ${activeTab === 'staff' ? 'user' : 'customer'}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaffUsers = staffUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    const currentData = activeTab === 'staff' ? filteredStaffUsers : filteredCustomers;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Add {activeTab === 'staff' ? 'User' : 'Customer'}
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'staff'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Staff Users
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'customers'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Customers
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex justify-between items-center">
                <div className="max-w-md">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'staff' ? 'staff' : 'customers'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={fetchData}
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
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">
                        Total {activeTab === 'staff' ? 'Staff' : 'Customers'}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">{currentData.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Active</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {currentData.filter(item => item.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
                    <p className="text-2xl font-bold text-red-600">
                        {currentData.filter(item => item.status === 'Inactive').length}
                    </p>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Add New {activeTab === 'staff' ? 'Staff User' : 'Customer'}</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newItem.email}
                            onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newItem.password}
                            onChange={(e) => setNewItem({...newItem, password: e.target.value})}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        {activeTab === 'staff' ? (
                            <select
                                value={newItem.role}
                                onChange={(e) => setNewItem({...newItem, role: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="Finance Manager">Finance Manager</option>
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="Delivery Staff">Delivery Staff</option>
                            </select>
                        ) : (
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={newItem.phone}
                                onChange={(e) => setNewItem({...newItem, phone: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        )}
                        {activeTab === 'customers' && (
                            <textarea
                                placeholder="Delivery Address"
                                value={newItem.deliveryAddress}
                                onChange={(e) => setNewItem({...newItem, deliveryAddress: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent col-span-2"
                                rows="3"
                                required
                            />
                        )}
                        <div className="col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                            >
                                {loading ? 'Adding...' : `Add ${activeTab === 'staff' ? 'User' : 'Customer'}`}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users/Customers Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading {activeTab}...</div>
                    </div>
                ) : currentData.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400">
                            {searchTerm 
                                ? `No ${activeTab} found matching your search.` 
                                : `No ${activeTab} found.`
                            }
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {activeTab === 'staff' ? 'User ID' : 'Customer ID'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    {activeTab === 'staff' ? (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                    ) : (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {activeTab === 'staff' ? item.userId : item.customerId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {activeTab === 'staff' ? item.role : item.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="text-green-600 hover:text-green-900 mr-3 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
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
                            Edit {activeTab === 'staff' ? 'Staff User' : 'Customer'}
                        </h3>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingItem._id, editingItem);
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
                            {activeTab === 'staff' ? (
                                <select
                                    value={editingItem.role}
                                    onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Finance Manager">Finance Manager</option>
                                    <option value="Inventory Manager">Inventory Manager</option>
                                    <option value="Delivery Staff">Delivery Staff</option>
                                </select>
                            ) : (
                                <>
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
                                        value={editingItem.deliveryAddress}
                                        onChange={(e) => setEditingItem({...editingItem, deliveryAddress: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows="3"
                                        required
                                    />
                                </>
                            )}
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
        </div>
    );
};

export default UserManagement;
