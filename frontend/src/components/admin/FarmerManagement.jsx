import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GoogleMapSelector from '../GoogleMapSelector';
import { LoadScript } from '@react-google-maps/api';
import { generateFarmerReportPDF } from '../../utils/farmerReportGenerator';

const FarmerManagement = ({ onStatsUpdate }) => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
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
        
        // Basic required field validation
        const errors = [];
        
        if (!newItem.name.trim()) {
            errors.push('Name is required');
        }
        
        if (!newItem.nic.trim()) {
            errors.push('NIC number is required');
        }
        
        if (!newItem.phone.trim()) {
            errors.push('Phone number is required');
        }
        
        if (!newItem.address.trim()) {
            errors.push('Address is required');
        }
        
        // if (!newItem.farm_location.latitude || !newItem.farm_location.longitude || !newItem.farm_location.address) {
        //     errors.push('Please select a farm location on the map');
        // }

        // Removed required validation for farm location map selection
        
        if (!newItem.pepper_capacitypermonth.green || Number(newItem.pepper_capacitypermonth.green) <= 0) {
            errors.push('Green pepper capacity must be greater than 0');
        }
        
        if (!newItem.pepper_capacitypermonth.black || Number(newItem.pepper_capacitypermonth.black) <= 0) {
            errors.push('Black pepper capacity must be greater than 0');
        }
        
        if (!newItem.price_per_unit.green || Number(newItem.price_per_unit.green) <= 0) {
            errors.push('Green pepper price must be greater than 0');
        }
        
        if (!newItem.price_per_unit.black || Number(newItem.price_per_unit.black) <= 0) {
            errors.push('Black pepper price must be greater than 0');
        }
        
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

    const generateReport = async () => {
        setGeneratingReport(true);
        try {
            const filters = {
                status: statusFilter === 'all' ? 'All Status' : statusFilter,
                search: searchTerm || 'None',
                location: 'All Locations'
            };
            
            const result = await generateFarmerReportPDF(filteredFarmers, filters);
            
            if (result.success) {
                alert('Farmer report generated successfully!');
            } else {
                alert('Failed to generate report: ' + result.error);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
        } finally {
            setGeneratingReport(false);
        }
    };


    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
    <div className="space-y-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={generateReport}
                        disabled={generatingReport || filteredFarmers.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {generatingReport ? 'Generating...' : 'Generate PDF Report'}
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Add Farmer
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search farmers by name, location, or NIC..."
                        value={searchTerm}
                        onChange={(e) => {
                            // allow only letters, numbers and spaces
                            const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                            setSearchTerm(sanitized);
                        }}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={newItem.name}
                                    maxLength={100}
                                    onChange={(e) => {
                                        // Only letters and spaces, max 100 chars
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                        setNewItem({...newItem, name: value});
                                    }}
                                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIC Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter NIC number (123456789V or 200012345678)"
                                    value={newItem.nic}
                                    maxLength={12}
                                    onChange={(e) => {
                                        // Only digits and V/X, max 12 chars
                                        const value = e.target.value.replace(/[^0-9vVxX]/g, '').slice(0, 12);
                                        setNewItem({...newItem, nic: value});
                                    }}
                                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number (10 digits)"
                                    value={newItem.phone}
                                    maxLength={10}
                                    onChange={(e) => {
                                        // Only digits, exactly 10 chars for Sri Lankan mobile
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                        setNewItem({...newItem, phone: value});
                                    }}
                                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={newItem.email}
                                    maxLength={100}
                                    onChange={(e) => {
                                        setNewItem({...newItem, email: e.target.value});
                                    }}
                                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                />
                            </div>
                            
                            <div className="col-span-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Farm Location
                                </label>
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
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    placeholder="Enter address (letters, numbers, spaces, punctuation allowed)"
                                    value={newItem.address}
                                    maxLength={500}
                                    onChange={(e) => setNewItem({...newItem, address: e.target.value.slice(0, 500)})}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    rows="2"
                                    required
                                />
                            </div>
                            
                            {/* Capacity Section */}
                            <div className="col-span-2">
                                <label className="block text-md font-medium text-gray-700 mb-2">
                                    Monthly Capacity (kg) *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Green Pepper (kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter green pepper capacity"
                                            value={newItem.pepper_capacitypermonth.green}
                                            max={10000}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                                                setNewItem({
                                                    ...newItem, 
                                                    pepper_capacitypermonth: {
                                                        ...newItem.pepper_capacitypermonth,
                                                        green: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Black Pepper (kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter black pepper capacity"
                                            value={newItem.pepper_capacitypermonth.black}
                                            max={10000}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                                                setNewItem({
                                                    ...newItem, 
                                                    pepper_capacitypermonth: {
                                                        ...newItem.pepper_capacitypermonth,
                                                        black: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Price Section */}
                            <div className="col-span-2">
                                <label className="block text-md font-medium text-gray-700 mb-2">
                                    Price per kg (LKR) *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Green Pepper Price (LKR)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter green pepper price"
                                            value={newItem.price_per_unit.green}
                                            max={999999}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                                setNewItem({
                                                    ...newItem, 
                                                    price_per_unit: {
                                                        ...newItem.price_per_unit,
                                                        green: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Black Pepper Price (LKR)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter black pepper price"
                                            value={newItem.price_per_unit.black}
                                            max={999999}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                                setNewItem({
                                                    ...newItem, 
                                                    price_per_unit: {
                                                        ...newItem.price_per_unit,
                                                        black: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
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
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Farm Location</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Capacity</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Prices</th>
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
                                        <td className="px-2 py-2 text-sm text-gray-500 break-words whitespace-normal truncate max-w-[200px]">{farmer.email || '—'}</td>
                                        <td className="px-2 py-2 text-sm text-gray-500 break-words whitespace-normal truncate max-w-[200px]">{farmer.farm_location?.address || 'N/A'}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <div className="text-xs">
                                                <div>G: {farmer.pepper_capacitypermonth?.green || 0}kg</div>
                                                <div>B: {farmer.pepper_capacitypermonth?.black || 0}kg</div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <div className="text-xs">
                                                <div>G: {farmer.price_per_unit?.green ? `Rs. ${farmer.price_per_unit.green}` : '—'}</div>
                                                <div>B: {farmer.price_per_unit?.black ? `Rs. ${farmer.price_per_unit.black}` : '—'}</div>
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
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(farmer._id)}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={editingItem.name}
                                    maxLength={100}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                        setEditingItem({...editingItem, name: value});
                                    }}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIC Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter NIC number (123456789V or 200012345678)"
                                    value={editingItem.nic}
                                    maxLength={12}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9vVxX]/g, '').slice(0, 12);
                                        setEditingItem({...editingItem, nic: value});
                                    }}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number (10 digits)"
                                    value={editingItem.phone}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                        setEditingItem({...editingItem, phone: value});
                                    }}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={editingItem.email || ''}
                                    maxLength={100}
                                    onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                />
                            </div>
                            <div className="col-span-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Farm Location
                                </label>
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
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    placeholder="Enter address (letters, numbers, spaces, punctuation allowed)"
                                    value={editingItem.address}
                                    maxLength={500}
                                    onChange={(e) => setEditingItem({...editingItem, address: e.target.value.slice(0, 500)})}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    rows="2"
                                    required
                                />
                            </div>
                            
                            {/* Capacity Section */}
                            <div className="col-span-2">
                                <label className="block text-md font-medium text-gray-700 mb-2">
                                    Monthly Capacity (kg) *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Green Pepper (kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter green pepper capacity"
                                            value={editingItem.pepper_capacitypermonth?.green || ''}
                                            max={10000}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                                                setEditingItem({
                                                    ...editingItem, 
                                                    pepper_capacitypermonth: {
                                                        ...editingItem.pepper_capacitypermonth,
                                                        green: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Black Pepper (kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter black pepper capacity"
                                            value={editingItem.pepper_capacitypermonth?.black || ''}
                                            max={10000}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                                                setEditingItem({
                                                    ...editingItem, 
                                                    pepper_capacitypermonth: {
                                                        ...editingItem.pepper_capacitypermonth,
                                                        black: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Price Section */}
                            <div className="col-span-2">
                                <label className="block text-md font-medium text-gray-700 mb-2">
                                    Price per kg (LKR) *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Green Pepper Price (LKR)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter green pepper price"
                                            value={editingItem.price_per_unit?.green || ''}
                                            max={999999}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                                setEditingItem({
                                                    ...editingItem, 
                                                    price_per_unit: {
                                                        ...editingItem.price_per_unit,
                                                        green: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Black Pepper Price (LKR)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter black pepper price"
                                            value={editingItem.price_per_unit?.black || ''}
                                            max={999999}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                                setEditingItem({
                                                    ...editingItem, 
                                                    price_per_unit: {
                                                        ...editingItem.price_per_unit,
                                                        black: value
                                                    }
                                                });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editingItem.status}
                                    onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            
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