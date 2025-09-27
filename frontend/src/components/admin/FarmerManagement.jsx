import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GoogleMapSelector from '../GoogleMapSelector';
import { LoadScript } from '@react-google-maps/api';

const FarmerManagement = ({ onStatsUpdate }) => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        nic: '',
        phone: '',
        email: '',
        address: '',
        farm_location: {
            latitude: null,
            longitude: null,
            address: ''
        },
        pepper_capacitypermonth: {
            green: '',
            black: ''
        },
        price_per_unit: {
            green: '',
            black: ''
        },
        status: 'Active'
    });
    const [fieldErrors, setFieldErrors] = useState({});

    // Validation helper function
    const validateField = (field, value) => {
        const errors = { ...fieldErrors };
        
        switch (field) {
            case 'nic':
                if (!value.trim()) {
                    errors.nic = 'NIC number is required';
                } else if (!/^(\d{8,9}[vVxX]|\d{12})$/.test(value.trim())) {
                    errors.nic = 'Enter valid NIC (8-9 digits + V/X or 12 digits)';
                } else {
                    delete errors.nic;
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
            case 'email':
                if (value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())) {
                    errors.email = 'Enter a valid email address';
                } else {
                    delete errors.email;
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
            default:
                break;
        }
        
        setFieldErrors(errors);
    };

    useEffect(() => {
        fetchFarmers();
    }, [statusFilter]);

    const fetchFarmers = async () => {
        setLoading(true);
        setError('');
        try {
            let url = '/api/farmers';
            const params = new URLSearchParams();
            
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
            
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFarmers(data.data || []);
                if (onStatsUpdate) onStatsUpdate();
            } else {
                setError('Failed to fetch farmers');
            }
        } catch (error) {
            console.error('Error fetching farmers:', error);
            setError('Error fetching farmers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (farmerId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        try {
            const response = await fetch(`/api/farmers/${farmerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchFarmers();
            } else {
                setError('Failed to update farmer status');
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
        
        // NIC validation
        if (!newItem.nic.trim()) {
            errors.push('NIC number is required');
        } else if (!/^(\d{8,9}[vVxX]|\d{12})$/.test(newItem.nic.trim())) {
            errors.push('Please enter a valid NIC number (8-9 digits + V/X or 12 digits)');
        }
        
        // Phone validation
        if (!newItem.phone.trim()) {
            errors.push('Phone number is required');
        } else if (!/^[0-9]{8,15}$/.test(newItem.phone.trim())) {
            errors.push('Please enter a valid phone number (8-15 digits)');
        }

        // Email validation (optional)
        if (newItem.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newItem.email.trim())) {
            errors.push('Please enter a valid email');
        }
        
        // Address validation
        if (!newItem.address.trim()) {
            errors.push('Address is required');
        } else if (newItem.address.length > 500) {
            errors.push('Address cannot exceed 500 characters');
        }
        
        // Farm location validation
        if (!newItem.farm_location.latitude || !newItem.farm_location.longitude || !newItem.farm_location.address) {
            errors.push('Please select a farm location on the map');
        }
        
        // Pepper capacity validation
        if (!newItem.pepper_capacitypermonth.green || Number(newItem.pepper_capacitypermonth.green) <= 0) {
            errors.push('Green pepper capacity must be greater than 0');
        } else if (Number(newItem.pepper_capacitypermonth.green) > 10000) {
            errors.push('Green pepper capacity cannot exceed 10,000 kg');
        }
        
        if (!newItem.pepper_capacitypermonth.black || Number(newItem.pepper_capacitypermonth.black) <= 0) {
            errors.push('Black pepper capacity must be greater than 0');
        } else if (Number(newItem.pepper_capacitypermonth.black) > 10000) {
            errors.push('Black pepper capacity cannot exceed 10,000 kg');
        }
        
        // Price validation
        if (!newItem.price_per_unit.green || Number(newItem.price_per_unit.green) <= 0) {
            errors.push('Green pepper price must be greater than 0');
        }
        
        if (!newItem.price_per_unit.black || Number(newItem.price_per_unit.black) <= 0) {
            errors.push('Black pepper price must be greater than 0');
        }
        
        // If there are validation errors, show them and stop
        if (errors.length > 0) {
            setError(errors.join('. '));
            setLoading(false);
            return;
        }
        
        // Prepare data with proper number conversions
        const farmerData = {
            ...newItem,
            pepper_capacitypermonth: {
                green: Number(newItem.pepper_capacitypermonth.green),
                black: Number(newItem.pepper_capacitypermonth.black)
            },
            price_per_unit: {
                green: Number(newItem.price_per_unit.green),
                black: Number(newItem.price_per_unit.black)
            },
            farm_location: {
                latitude: Number(newItem.farm_location.latitude),
                longitude: Number(newItem.farm_location.longitude),
                address: newItem.farm_location.address
            }
        };
        
        console.log('Sending farmer data:', farmerData);
        
        try {
            const response = await fetch('/api/farmers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(farmerData)
            });

            if (response.ok) {
                setNewItem({
                    name: '',
                    nic: '',
                    phone: '',
                    email: '',
                    address: '',
                    farm_location: {
                        latitude: null,
                        longitude: null,
                        address: ''
                    },
                    pepper_capacitypermonth: {
                        green: '',
                        black: ''
                    },
                    price_per_unit: {
                        green: '',
                        black: ''
                    },
                    status: 'Active'
                });
                setShowAddForm(false);
                fetchFarmers();
            } else {
                const data = await response.json();
                console.log('Error response:', data);
                console.log('Validation errors:', data.errors);
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors.join(', '));
                } else {
                    setError(data.message || 'Failed to add farmer');
                }
            }
        } catch (error) {
            console.error('Error adding farmer:', error);
            setError('Error adding farmer');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (farmerId, updatedData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/farmers/${farmerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditingItem(null);
                fetchFarmers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update farmer');
            }
        } catch (error) {
            console.error('Error updating farmer:', error);
            setError('Error updating farmer');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (farmerId) => {
        if (!window.confirm('Are you sure you want to delete this farmer?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/farmers/${farmerId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchFarmers();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete farmer');
            }
        } catch (error) {
            console.error('Error deleting farmer:', error);
            setError('Error deleting farmer');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchFarmers();
    };

    const filteredFarmers = farmers.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farm_location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.nic?.includes(searchTerm)
    );


    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
    <div className="space-y-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Add Farmer
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search farmers by name, location, or NIC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500 placeholder-green-700"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-blue-400 bg-blue-50 text-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Search
                </button>
                <button
                    onClick={fetchFarmers}
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
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-green-700">Total Farmers</h3>
                    <p className="text-2xl font-bold text-green-900">{filteredFarmers.length}</p>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-blue-700">Active</h3>
                    <p className="text-2xl font-bold text-blue-900">
                        {filteredFarmers.filter(farmer => farmer.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-yellow-700">Inactive</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                        {filteredFarmers.filter(farmer => farmer.status === 'Inactive').length}
                    </p>
                </div>
                <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-red-700">Monthly Capacity</h3>
                    <p className="text-lg font-bold text-red-900">
                        {filteredFarmers.reduce((sum, farmer) => 
                            sum + (farmer.pepper_capacitypermonth?.green || 0) + (farmer.pepper_capacitypermonth?.black || 0), 0
                        )} kg
                    </p>
                </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{zIndex: 9999}}>
                    <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{position: 'relative', zIndex: 10000}}>
                        <h3 className="text-lg font-medium mb-4">Add New Farmer</h3>
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
                                    type="text"
                                    placeholder="NIC Number"
                                    value={newItem.nic}
                                    onChange={(e) => {
                                        setNewItem({...newItem, nic: e.target.value});
                                        validateField('nic', e.target.value);
                                    }}
                                    className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                                        fieldErrors.nic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {fieldErrors.nic && <p className="text-red-500 text-sm mt-1">{fieldErrors.nic}</p>}
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
                                />
                                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
                            </div>
                            
                            <div className="col-span-2 mb-4">
                                <div className="text-sm font-medium text-gray-600 mb-3">Farm Location</div>
                                {newItem.farm_location.address && (
                                    <div className="text-sm text-green-700 mb-3 p-2 bg-green-50 rounded">{newItem.farm_location.address}</div>
                                )}
                                <div className="h-64 border border-gray-300 rounded overflow-hidden">
                                    <GoogleMapSelector 
                                        onLocationSelect={(location) => {
                                            setNewItem({
                                                ...newItem,
                                                farm_location: location
                                            });
                                        }}
                                        initialLocation={newItem.farm_location}
                                        showInstructions={false}
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder="Address"
                                value={newItem.address}
                                onChange={(e) => setNewItem({...newItem, address: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent col-span-2"
                                rows="2"
                                required
                            />
                            
                            {/* Capacity Section */}
                            <div className="col-span-2">
                                <h4 className="text-md font-medium mb-2">Monthly Capacity (kg)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Green Pepper (kg)"
                                        value={newItem.pepper_capacitypermonth.green}
                                        onChange={(e) => setNewItem({
                                            ...newItem, 
                                            pepper_capacitypermonth: {
                                                ...newItem.pepper_capacitypermonth,
                                                green: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Black Pepper (kg)"
                                        value={newItem.pepper_capacitypermonth.black}
                                        onChange={(e) => setNewItem({
                                            ...newItem, 
                                            pepper_capacitypermonth: {
                                                ...newItem.pepper_capacitypermonth,
                                                black: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Price Section */}
                            <div className="col-span-2">
                                <h4 className="text-md font-medium mb-2">Price per kg (LKR)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Green Pepper Price"
                                        value={newItem.price_per_unit.green}
                                        onChange={(e) => setNewItem({
                                            ...newItem, 
                                            price_per_unit: {
                                                ...newItem.price_per_unit,
                                                green: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Black Pepper Price"
                                        value={newItem.price_per_unit.black}
                                        onChange={(e) => setNewItem({
                                            ...newItem, 
                                            price_per_unit: {
                                                ...newItem.price_per_unit,
                                                black: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-span-2 flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Adding...' : 'Add Farmer'}
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

            {/* Farmers Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading farmers...</div>
                    </div>
                ) : filteredFarmers.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400">
                            {searchTerm 
                                ? 'No farmers found matching your search.' 
                                : 'No farmers found.'
                            }
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Farmer ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">NIC</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Email</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Farm Location</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Capacity</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFarmers.map((farmer, idx) => (
                                    <tr key={farmer._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]">{farmer.farmerId}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 truncate max-w-[120px]">{farmer.name}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">{farmer.nic}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">{farmer.phone}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell truncate max-w-[120px]">{farmer.email || '—'}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell truncate max-w-[120px]">{farmer.farm_location?.address || 'N/A'}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <div className="text-xs">
                                                <div>G: {farmer.pepper_capacitypermonth?.green || 0}kg</div>
                                                <div>B: {farmer.pepper_capacitypermonth?.black || 0}kg</div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleStatusToggle(farmer._id, farmer.status)}
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                                                    farmer.status === 'Active' 
                                                        ? 'bg-green-200 text-green-900 hover:bg-green-300'
                                                        : 'bg-red-200 text-red-900 hover:bg-red-300'
                                                }`}
                                            >
                                                {farmer.status}
                                            </button>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditingItem(farmer)}
                                                className="text-green-600 hover:text-green-900 mr-3 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(farmer._id)}
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
            {editingItem && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{zIndex: 9999}}>
                    <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{position: 'relative', zIndex: 10000}}>
                        <h3 className="text-lg font-medium mb-4">Edit Farmer</h3>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingItem._id, editingItem);
                            }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="text"
                                placeholder="NIC Number"
                                value={editingItem.nic}
                                onChange={(e) => setEditingItem({...editingItem, nic: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={editingItem.phone}
                                onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={editingItem.email || ''}
                                onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <div className="col-span-2 mb-4">
                                <div className="text-sm font-medium text-gray-600 mb-3">Farm Location</div>
                                {editingItem.farm_location?.address && (
                                    <div className="text-sm text-green-700 mb-3 p-2 bg-green-50 rounded">{editingItem.farm_location.address}</div>
                                )}
                                <div className="h-64 border border-gray-300 rounded overflow-hidden">
                                    <GoogleMapSelector 
                                        onLocationSelect={(location) => {
                                            setEditingItem({
                                                ...editingItem,
                                                farm_location: location
                                            });
                                        }}
                                        initialLocation={editingItem.farm_location}
                                        showInstructions={false}
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder="Address"
                                value={editingItem.address}
                                onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent col-span-2"
                                rows="2"
                                required
                            />
                            
                            {/* Capacity Section */}
                            <div className="col-span-2">
                                <h4 className="text-md font-medium mb-2">Monthly Capacity (kg)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Green Pepper (kg)"
                                        value={editingItem.pepper_capacitypermonth?.green || ''}
                                        onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            pepper_capacitypermonth: {
                                                ...editingItem.pepper_capacitypermonth,
                                                green: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Black Pepper (kg)"
                                        value={editingItem.pepper_capacitypermonth?.black || ''}
                                        onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            pepper_capacitypermonth: {
                                                ...editingItem.pepper_capacitypermonth,
                                                black: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Price Section */}
                            <div className="col-span-2">
                                <h4 className="text-md font-medium mb-2">Price per kg (LKR)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Green Pepper Price"
                                        value={editingItem.price_per_unit?.green || ''}
                                        onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            price_per_unit: {
                                                ...editingItem.price_per_unit,
                                                green: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Black Pepper Price"
                                        value={editingItem.price_per_unit?.black || ''}
                                        onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            price_per_unit: {
                                                ...editingItem.price_per_unit,
                                                black: e.target.value
                                            }
                                        })}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <select
                                value={editingItem.status}
                                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            
                            <div className="col-span-2 flex gap-3 pt-4">
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
                </div>,
                document.body
            )}

        </div>
        </LoadScript>
    );
};

export default FarmerManagement;