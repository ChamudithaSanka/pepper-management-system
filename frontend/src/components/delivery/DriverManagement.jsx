import React, { useState, useEffect } from 'react';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nic: '',
        phone: '',
        email: '',
        licenseNumber: '',
        vehicleNumber: ''
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/delivery/drivers', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setDrivers(data.data || []);
            } else {
                setError('Failed to fetch drivers');
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
            setError('Error fetching drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = editingDriver 
                ? `/api/delivery/drivers/${editingDriver._id}`
                : '/api/delivery/drivers';
            
            const method = editingDriver ? 'PUT' : 'POST';

            // Prepare data for submission - all fields are required
            const submitData = {
                name: formData.name,
                nic: formData.nic,
                phone: formData.phone,
                email: formData.email.trim(),
                licenseNumber: formData.licenseNumber,
                vehicleNumber: formData.vehicleNumber
            };

            console.log('Submitting data:', submitData);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(submitData)
            });

            const responseData = await response.json();

            if (response.ok) {
                fetchDrivers();
                resetForm();
                alert(editingDriver ? 'Driver updated successfully!' : 'Driver added successfully!');
            } else {
                console.error('Error response:', responseData);
                console.error('Response status:', response.status);
                setError(responseData.message || responseData.error || 'Failed to save driver');
            }
        } catch (error) {
            console.error('Error saving driver:', error);
            setError('Network error: Failed to save driver');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (driver) => {
        setError('');
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            nic: driver.nic,
            phone: driver.phone,
            email: driver.email,
            licenseNumber: driver.licenseNumber,
            vehicleNumber: driver.vehicleNumber
        });
        setShowEditModal(true);
    };

    const handleDelete = async (driverId) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        try {
            const response = await fetch(`/api/delivery/drivers/${driverId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchDrivers();
                alert('Driver deleted successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to delete driver');
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
            alert('Error deleting driver');
        }
    };


    const resetForm = () => {
        setFormData({
            name: '',
            nic: '',
            phone: '',
            email: '',
            licenseNumber: '',
            vehicleNumber: ''
        });
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingDriver(null);
        setError('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-800';
            case 'Busy':
                return 'bg-red-100 text-red-800';
            case 'Assigned':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        if (filterStatus === 'all') return true;
        return driver.status === filterStatus;
    });

    const stats = {
        total: drivers.length,
        available: drivers.filter(d => d.status === 'Available').length,
        busy: drivers.filter(d => d.status === 'Busy').length,
        assigned: drivers.filter(d => d.status === 'Assigned').length
    };

    if (loading && drivers.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="text-center text-gray-500 mt-2">Loading drivers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
                    <p className="text-gray-600 mt-1">Manage delivery drivers and their information</p>
                </div>
                <button
                    onClick={() => {
                        setError('');
                        setShowAddModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Driver
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-700 text-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium">Total Drivers</h3>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-green-200 to-green-500 text-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium">Available</h3>
                    <p className="text-2xl font-bold">{stats.available}</p>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-red-700 text-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium">Busy</h3>
                    <p className="text-2xl font-bold">{stats.busy}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-700 text-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium">Assigned</h3>
                    <p className="text-2xl font-bold">{stats.assigned}</p>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2">
                {[ 
                    { key: 'all', label: 'All Drivers' },
                    { key: 'Available', label: 'Available' },
                    { key: 'Busy', label: 'Busy' },
                    { key: 'Assigned', label: 'Assigned' }
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                            filterStatus === filter.key 
                                ? 'bg-green-600 text-white border-green-700' 
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-green-700 bg-green-700">
                    <h3 className="text-lg font-semibold text-white">Driver List</h3>
                </div>
                
                {filteredDrivers.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Drivers Found</h3>
                        <p className="text-gray-500">
                            {filterStatus === 'all' 
                                ? 'No drivers have been added yet' 
                                : `No ${filterStatus.toLowerCase()} drivers found`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">License</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vehicle Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDrivers.map((driver) => (
                                    <tr key={driver._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.driverId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.nic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.licenseNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.vehicleNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(driver)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(driver._id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                                >
                                                    Delete
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

            {/* Add/Edit Driver Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                            </h3>
                            
                            {/* Error Display in Modal */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Driver Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter driver name"
                                            value={formData.name}
                                            maxLength={100}
                                            onChange={(e) => {
                                                // Only letters and spaces, max 100 chars
                                                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                                setFormData(prev => ({...prev, name: value}));
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NIC Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nic}
                                            maxLength={12}
                                            onChange={(e) => {
                                                // Only digits and V/X, max 12 chars
                                                const value = e.target.value.replace(/[^0-9vVxX]/g, '').slice(0, 12);
                                                setFormData(prev => ({...prev, nic: value}));
                                            }}
                                            placeholder="Enter NIC number (123456789V or 200012345678)"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            maxLength={10}
                                            onChange={(e) => {
                                                // Only digits, exactly 10 chars for Sri Lankan mobile
                                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                setFormData(prev => ({...prev, phone: value}));
                                            }}
                                            placeholder="Enter mobile number (10 digits)"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            maxLength={100}
                                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                            placeholder="Enter email address"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            License Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.licenseNumber}
                                            maxLength={20}
                                            onChange={(e) => {
                                                // Only alphanumeric characters and common license number separators
                                                const value = e.target.value.replace(/[^a-zA-Z0-9\-\s]/g, '').slice(0, 20);
                                                setFormData(prev => ({...prev, licenseNumber: value}));
                                            }}
                                            placeholder="Enter license number"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vehicle Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.vehicleNumber}
                                            maxLength={15}
                                            onChange={(e) => {
                                                // Only alphanumeric characters and common vehicle number separators
                                                const value = e.target.value.replace(/[^a-zA-Z0-9\-\s]/g, '').slice(0, 15);
                                                setFormData(prev => ({...prev, vehicleNumber: value}));
                                            }}
                                            placeholder="Enter vehicle number (e.g., ABC-1234)"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverManagement;
