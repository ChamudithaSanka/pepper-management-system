import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GoogleMapSelector from './GoogleMapSelector';

const CheckoutCustomerDetails = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customerData, setCustomerData] = useState(null);
    const [cart, setCart] = useState(null);
    const [editMode, setEditMode] = useState({
        name: false,
        email: false,
        phone: false,
        address: false
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        deliveryAddress: '',
        location: { latitude: null, longitude: null, address: '' }
    });
    const [showMapSection, setShowMapSection] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkSessionAndLoadData();
    }, []);

    const checkSessionAndLoadData = async () => {
        try {
            // Check session
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();

            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to proceed with checkout');
                setLoading(false);
                return;
            }

            const customerId = sessionData.customer.customerId;

            // Load customer data and cart simultaneously
            const [customerResponse, cartResponse] = await Promise.all([
                fetch(`/api/customers/profile/${customerId}`, {
                    credentials: 'include'
                }),
                fetch(`/api/customers/${customerId}/cart`, {
                    credentials: 'include'
                })
            ]);

            const customerResult = await customerResponse.json();
            const cartResult = await cartResponse.json();

            if (customerResult.success) {
                setCustomerData(customerResult.data);
                setFormData({
                    name: customerResult.data.name,
                    email: customerResult.data.email,
                    phone: customerResult.data.phone,
                    deliveryAddress: customerResult.data.deliveryAddress,
                    location: customerResult.data.location || { latitude: null, longitude: null, address: '' }
                });
            }

            if (cartResult.success) {
                setCart(cartResult.data);
                if (!cartResult.data.items || cartResult.data.items.length === 0) {
                    setError('Your cart is empty. Please add items before checkout.');
                }
            } else {
                setError('Failed to load cart data');
            }

        } catch (error) {
            setError('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleEditMode = (field) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const saveField = async (field) => {
        try {
            const updateData = { [field]: formData[field] };
            
            const response = await fetch(`/api/customers/profile/${customerData.customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            if (result.success) {
                setCustomerData(prev => ({ ...prev, [field]: formData[field] }));
                toggleEditMode(field);
            } else {
                setError(`Failed to update ${field}`);
            }
        } catch (error) {
            setError(`Failed to update ${field}`);
        }
    };

    const handleLocationSelect = async (location) => {
        try {
            const updateData = { location };
            
            const response = await fetch(`/api/customers/profile/${customerData.customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            if (result.success) {
                setFormData(prev => ({ ...prev, location }));
                setCustomerData(prev => ({ ...prev, location }));
                setShowMapSection(false);
            } else {
                setError('Failed to update delivery location');
            }
        } catch (error) {
            setError('Failed to update delivery location');
        }
    };

    const proceedToPayment = () => {
        // Validate required fields
        if (!formData.name || !formData.email || !formData.phone || !formData.deliveryAddress) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.location.latitude || !formData.location.longitude) {
            setError('Please select delivery location on map');
            return;
        }

        // Navigate to payment page with checkout data
        navigate('/checkout/payment', {
            state: {
                customerDetails: formData,
                cart: cart
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-green-400">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading checkout details...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && (!cart || cart.items.length === 0)) {
        return (
            <div className="min-h-screen bg-black text-green-400">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-xl text-red-400 mb-4">{error}</div>
                        <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-green-400">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="text-sm">
                        <Link to="/cart" className="text-green-400 hover:text-green-300">Cart</Link>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-white">Customer Details</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-400">Payment</span>
                    </nav>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Customer Details Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
                            
                            {error && (
                                <div className="bg-red-900 border border-red-600 text-red-400 px-4 py-3 rounded mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Name Field */}
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        {editMode.name ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                                />
                                                <button
                                                    onClick={() => saveField('name')}
                                                    className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('name')}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">{formData.name}</div>
                                        )}
                                    </div>
                                    {!editMode.name && (
                                        <button
                                            onClick={() => toggleEditMode('name')}
                                            className="text-green-400 hover:text-green-300 ml-4"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Email Address</label>
                                        {editMode.email ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                                />
                                                <button
                                                    onClick={() => saveField('email')}
                                                    className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('email')}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">{formData.email}</div>
                                        )}
                                    </div>
                                    {!editMode.email && (
                                        <button
                                            onClick={() => toggleEditMode('email')}
                                            className="text-green-400 hover:text-green-300 ml-4"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                                        {editMode.phone ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                                />
                                                <button
                                                    onClick={() => saveField('phone')}
                                                    className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('phone')}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">{formData.phone}</div>
                                        )}
                                    </div>
                                    {!editMode.phone && (
                                        <button
                                            onClick={() => toggleEditMode('phone')}
                                            className="text-green-400 hover:text-green-300 ml-4"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>

                                {/* Delivery Address Field */}
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Delivery Address</label>
                                        {editMode.address ? (
                                            <div className="flex gap-2">
                                                <textarea
                                                    value={formData.deliveryAddress}
                                                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                                    rows="3"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => saveField('deliveryAddress')}
                                                        className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditMode('address')}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">{formData.deliveryAddress}</div>
                                        )}
                                    </div>
                                    {!editMode.address && (
                                        <button
                                            onClick={() => toggleEditMode('address')}
                                            className="text-green-400 hover:text-green-300 ml-4"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>

                                {/* Delivery Location */}
                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium">Delivery Location</label>
                                        <button
                                            onClick={() => setShowMapSection(!showMapSection)}
                                            className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
                                        >
                                            📍 {showMapSection ? 'Hide Map' : 'Select Location on Map'}
                                        </button>
                                    </div>
                                    {formData.location.address ? (
                                        <div className="text-gray-400">
                                            📍 {formData.location.address}
                                        </div>
                                    ) : (
                                        <div className="text-yellow-400">
                                            ⚠️ Please select delivery location on map
                                        </div>
                                    )}
                                </div>

                                {/* Inline Map Section */}
                                {showMapSection && (
                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <h3 className="text-lg font-bold mb-4">Select Delivery Location</h3>
                                        <GoogleMapSelector
                                            onLocationSelect={handleLocationSelect}
                                            initialLocation={formData.location}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                            
                            {cart && cart.items && (
                                <>
                                    <div className="space-y-3 mb-6">
                                        {cart.items.map((item) => (
                                            <div key={item.productId._id} className="flex justify-between text-sm">
                                                <div className="flex-1">
                                                    <div className="font-medium">{item.productId.productName}</div>
                                                    <div className="text-gray-400">Qty: {item.quantity}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({cart.totalItems} items):</span>
                                            <span>₹{cart.totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee:</span>
                                            <span className="text-green-400">FREE</span>
                                        </div>
                                        <hr className="border-green-600" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span>₹{cart.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={proceedToPayment}
                                        className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded transition-colors"
                                    >
                                        Continue to Payment
                                    </button>
                                </>
                            )}

                            <div className="mt-4 text-xs text-gray-400">
                                <p>• Secure checkout process</p>
                                <p>• Free delivery on all orders</p>
                                <p>• 24/7 customer support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CheckoutCustomerDetails;
