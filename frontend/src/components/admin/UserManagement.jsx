import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const UserManagement = ({ onStatsUpdate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Admin'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (showAddForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAddForm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
                if (onStatsUpdate) onStatsUpdate();
            } else {
                setError('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchUsers();
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
        
        if (!newItem.name.trim() || !newItem.email.trim() || !newItem.password.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const payload = { 
                name: newItem.name.trim(), 
                email: newItem.email.trim(), 
                password: newItem.password, 
                role: newItem.role,
                status: 'Active'
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNewItem({ name: '', email: '', password: '', role: 'Admin' });
                setShowAddForm(false);
                fetchUsers();
            } else {
                const data = await response.json();
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors.join(', '));
                } else {
                    setError(data.message || 'Failed to add user');
                }
            }
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Error adding user');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (itemId, updatedData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditingItem(null);
                fetchUsers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            setError('Error updating user');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    // No search/filtering — just sort by userId ascending
    const filteredUsers = [...users].sort((a, b) => (a.userId ?? 0) - (b.userId ?? 0));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Add User
                </button>
            </div>

            {/* Refresh */}
            <div className="flex justify-end items-center gap-4">
                <button
                    onClick={fetchUsers}
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
                    <h3 className="text-sm font-medium text-green-700">Total Users</h3>
                    <p className="text-2xl font-bold text-green-900">{filteredUsers.length}</p>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-blue-700">Active</h3>
                    <p className="text-2xl font-bold text-blue-900">
                        {filteredUsers.filter(item => item.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-yellow-700">Inactive</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                        {filteredUsers.filter(item => item.status === 'Inactive').length}
                    </p>
                </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Add New User</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={newItem.name}
                                maxLength={100}
                                onChange={(e) => {
                                    // Only letters and spaces, max 100 chars
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                    setNewItem({...newItem, name: value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={newItem.email}
                                onChange={(e) => {
                                    setNewItem({...newItem, email: e.target.value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={newItem.password}
                                minLength={8}
                                maxLength={32}
                                onChange={(e) => {
                                    // Only allow 8-32 chars, no spaces
                                    const value = e.target.value.replace(/\s/g, '').slice(0, 32);
                                    setNewItem({...newItem, password: value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={newItem.role}
                                onChange={(e) => setNewItem({...newItem, role: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Finance Manager">Finance Manager</option>
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="Delivery Manager">Delivery Manager</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Adding...' : 'Add User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Staff Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading users...</div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400">No users found.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((item, idx) => (
                                    <tr key={item._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.userId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.role}
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
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
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
                            Edit User
                        </h3>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (!editingItem.name.trim() || !editingItem.email.trim()) {
                                    setError('Please fill in all required fields');
                                    return;
                                }

                                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingItem.email)) {
                                    setError('Please enter a valid email address');
                                    return;
                                }

                                // Validate password only if admin provided one
                                if (editingItem.password && (editingItem.password.length < 8 || editingItem.password.length > 32)) {
                                    setError('Password must be 8-32 characters long');
                                    return;
                                }

                                setError('');

                                // Build update payload: only include password if provided
                                const payload = { ...editingItem };
                                if (!payload.password) {
                                    delete payload.password;
                                }

                                handleUpdate(editingItem._id, payload);
                            }}
                            className="space-y-4"
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={editingItem.name}
                                maxLength={100}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                    setEditingItem({...editingItem, name: value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={editingItem.email}
                                onChange={(e) => {
                                    setEditingItem({...editingItem, email: e.target.value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={editingItem.role}
                                onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Finance Manager">Finance Manager</option>
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="Delivery Manager">Delivery Manager</option>
                            </select>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                placeholder="New Password (leave blank to keep current)"
                                value={editingItem.password || ''}
                                minLength={8}
                                maxLength={32}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '').slice(0, 32);
                                    setEditingItem({...editingItem, password: value});
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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