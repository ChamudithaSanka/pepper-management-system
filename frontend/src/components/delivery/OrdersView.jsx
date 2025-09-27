import React, { useState, useEffect, useRef } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES = ['places'];

// Map component to display multiple order markers
const OrdersMap = ({ orders, mapCenter }) => {
    const mapRef = useRef(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const mapOptions = {
        disableDefaultUI: false,
        clickableIcons: true,
        scrollwheel: true
    };

    const onLoad = (map) => {
        mapRef.current = map;
    };

    const getMarkerIcon = (status) => {
        switch (status) {
            case 'Pending':
                return {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" fill="#F59E0B" stroke="white" stroke-width="2"/>
                            <circle cx="10" cy="10" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(20, 20)
                };
            case 'Shipped':
                return {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                            <circle cx="10" cy="10" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(20, 20)
                };
            case 'Delivered':
                return {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" fill="#10B981" stroke="white" stroke-width="2"/>
                            <circle cx="10" cy="10" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(20, 20)
                };
            default:
                return null;
        }
    };

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={mapCenter}
            zoom={10}
            onLoad={onLoad}
            options={mapOptions}
        >
            {orders.map((order, index) => (
                <Marker
                    key={index}
                    position={{
                        lat: order.location?.latitude || 6.9271,
                        lng: order.location?.longitude || 79.8612
                    }}
                    icon={getMarkerIcon(order.status)}
                    onClick={() => setSelectedOrder(order)}
                />
            ))}
            
            {selectedOrder && (
                <InfoWindow
                    position={{
                        lat: selectedOrder.location?.latitude || 6.9271,
                        lng: selectedOrder.location?.longitude || 79.8612
                    }}
                    onCloseClick={() => setSelectedOrder(null)}
                >
                    <div className="p-2">
                        <h4 className="font-semibold text-gray-900">{selectedOrder.orderId}</h4>
                        <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedOrder.location?.address}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {selectedOrder.status}
                        </span>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

const OrdersView = ({ onStatsUpdate }) => {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo, Sri Lanka

    useEffect(() => {
        fetchOrders();
        fetchDrivers();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/delivery/orders', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Orders data:', data.data.orders);
                setOrders(data.data.orders || []);
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

    const fetchDrivers = async () => {
        try {
            const response = await fetch('/api/delivery/drivers', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setDrivers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleAssignDriver = (order) => {
        setSelectedOrder(order);
        setSelectedDriver('');
        setShowAssignModal(true);
    };

    const confirmAssignment = async () => {
        if (!selectedDriver) {
            alert('Please select a driver');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/delivery/orders/${selectedOrder.orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ driverId: selectedDriver })
            });

            const responseData = await response.json();

            if (response.ok) {
                fetchOrders();
                fetchDrivers(); // Refresh drivers to update status
                if (onStatsUpdate) onStatsUpdate();
                setShowAssignModal(false);
                alert('Driver assigned successfully!');
            } else {
                alert(responseData.message || 'Failed to assign driver');
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
            alert('Error assigning driver');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    const filteredOrders = orders.filter(order => {
        const statusMatch = filterStatus === 'all' || order.status === filterStatus;
        return statusMatch;
    });

    const availableDrivers = drivers.filter(driver => driver.status === 'Available');

    // Prepare map markers data from orders
    const mapMarkers = filteredOrders.map(order => ({
        position: {
            lat: order.location?.latitude || 6.9271,
            lng: order.location?.longitude || 79.8612
        },
        title: `Order ${order.orderId}`,
        info: {
            orderId: order.orderId,
            customerName: order.customerName,
            status: order.status,
            address: order.location?.address || 'No address available',
            items: order.details.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No items'
        }
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
                    <p className="text-gray-600 mt-1">View and assign drivers to customer orders</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            showMap 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {showMap ? 'Table View' : 'Map View'}
                    </button>
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
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

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {showMap ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Orders Map View</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {mapMarkers.length} order{mapMarkers.length !== 1 ? 's' : ''} on map
                        </p>
                    </div>
                    <div className="p-4">
                        {mapMarkers.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders to display</h3>
                                <p className="text-gray-500">No orders available for map view</p>
                            </div>
                        ) : (
                            <div>
                                <LoadScript
                                    key="orders-map-script"
                                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                                libraries={GOOGLE_MAPS_LIBRARIES}
                                >
                                    <div className="h-96 w-full">
                                        <OrdersMap orders={filteredOrders} mapCenter={mapCenter} />
                                    </div>
                                </LoadScript>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mapMarkers.map((marker, index) => (
                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{marker.info.orderId}</h4>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(marker.info.status)}`}>
                                                    {marker.info.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">{marker.info.customerName}</p>
                                            <p className="text-xs text-gray-500 mb-2 truncate">{marker.info.address}</p>
                                            <p className="text-xs text-gray-500">{marker.info.items}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Table View */
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">
                                {filterStatus === 'all' 
                                    ? 'No customer orders available'
                                    : `No ${filterStatus.toLowerCase()} customer orders found`
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
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Address
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
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.orderId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.details.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No items'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.customerName}</div>
                                                <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="max-w-xs truncate">
                                                    {order.location?.address || 'No address available'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {order.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleAssignDriver(order)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Assign Driver
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">Assigned</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Assign Driver Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Assign Driver to Order {selectedOrder?.orderId}
                            </h3>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Available Driver
                                </label>
                                <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Choose a driver...</option>
                                    {availableDrivers.map((driver) => (
                                        <option key={driver._id} value={driver._id}>
                                            {driver.name} - {driver.vehicleNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {availableDrivers.length === 0 && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                        No available drivers. Please add drivers or wait for current deliveries to complete.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAssignment}
                                    disabled={!selectedDriver || loading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                                >
                                    {loading ? 'Assigning...' : 'Assign Driver'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersView;
