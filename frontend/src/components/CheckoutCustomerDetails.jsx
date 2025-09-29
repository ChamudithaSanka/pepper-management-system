import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GoogleMapSelector from './GoogleMapSelector';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const CheckoutCustomerDetails = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customerData, setCustomerData] = useState(null);
    const [cart, setCart] = useState(null);
    const autocompleteRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        deliveryAddress: {
            street: '',
            city: '',
            zipCode: '',
            fullAddress: ''
        },
        location: { latitude: null, longitude: null, address: '' }
    });

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
                const addressData = customerResult.data.deliveryAddress || {};
                setFormData({
                    name: customerResult.data.name,
                    email: customerResult.data.email,
                    phone: customerResult.data.phone,
                    deliveryAddress: {
                        street: addressData.street || '',
                        city: addressData.city || '',
                        zipCode: addressData.zipCode || '',
                        fullAddress: addressData.fullAddress || ''
                    },
                    location: {
                        latitude: addressData.latitude || null,
                        longitude: addressData.longitude || null,
                        address: addressData.fullAddress || ''
                    }
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

    // Validation functions
    const validateName = (value) => {
        // Only allow letters, spaces, hyphens, and apostrophes
        return value.replace(/[^a-zA-Z\s\-']/g, '');
    };

    const validateEmail = (value) => {
        // Basic email validation - allow letters, numbers, dots, hyphens, underscores, and @ symbol
        return value.replace(/[^a-zA-Z0-9@._-]/g, '');
    };

    const validatePhone = (value) => {
        // Only allow digits, limit to 10 characters
        return value.replace(/\D/g, '').slice(0, 10);
    };

    const validateStreet = (value) => {
        // Allow letters, numbers, spaces, hyphens, apostrophes, periods, and common address characters
        return value.replace(/[^a-zA-Z0-9\s\-'.,#/]/g, '');
    };

    const validateCity = (value) => {
        // Only allow letters, spaces, and hyphens
        return value.replace(/[^a-zA-Z\s\-]/g, '');
    };

    const validateZipCode = (value) => {
        // Only allow digits, limit to 5 characters
        return value.replace(/\D/g, '').slice(0, 5);
    };

    const handleInputChange = (field, value) => {
        let validatedValue = value;

        // Apply validation based on field type
        switch (field) {
            case 'name':
                validatedValue = validateName(value);
                break;
            case 'email':
                validatedValue = validateEmail(value);
                break;
            case 'phone':
                validatedValue = validatePhone(value);
                break;
            case 'street':
                validatedValue = validateStreet(value);
                break;
            case 'city':
                validatedValue = validateCity(value);
                break;
            case 'zipCode':
                validatedValue = validateZipCode(value);
                break;
            default:
                validatedValue = value;
        }

        if (field === 'street' || field === 'city' || field === 'zipCode') {
            setFormData(prev => {
                const updatedAddress = {
                    ...prev.deliveryAddress,
                    [field]: validatedValue
                };
                
                // Construct full address from updated fields
                const fullAddress = `${updatedAddress.street || ''}, ${updatedAddress.city || ''}, ${updatedAddress.zipCode || ''}`
                    .replace(/,\s*,/g, ',')
                    .replace(/^,\s*|,\s*$/g, '')
                    .trim();
                
                return {
                    ...prev,
                    deliveryAddress: {
                        ...updatedAddress,
                        fullAddress: fullAddress
                    }
                };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: validatedValue
            }));
        }
    };



    const saveField = async (field) => {
        try {
            let updateData;
            if (field === 'street' || field === 'city' || field === 'zipCode') {
                // Construct full address from individual parts
                const fullAddress = `${formData.deliveryAddress.street}, ${formData.deliveryAddress.city}, ${formData.deliveryAddress.zipCode}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
                
                updateData = { 
                    deliveryAddress: {
                        street: formData.deliveryAddress.street,
                        city: formData.deliveryAddress.city,
                        zipCode: formData.deliveryAddress.zipCode,
                        fullAddress: fullAddress,
                        latitude: formData.location.latitude || 0,
                        longitude: formData.location.longitude || 0
                    }
                };
            } else {
                updateData = { [field]: formData[field] };
            }
            
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
                if (field === 'street' || field === 'city' || field === 'zipCode') {
                    setCustomerData(prev => ({ ...prev, deliveryAddress: updateData.deliveryAddress }));
                } else {
                    setCustomerData(prev => ({ ...prev, [field]: formData[field] }));
                }
            } else {
                setError(`Failed to update ${field}`);
            }
        } catch (error) {
            setError(`Failed to update ${field}`);
        }
    };

    const handleLocationSelect = async (location) => {
        try {
            // Keep existing address fields and just update coordinates and fullAddress
            const updateData = { 
                deliveryAddress: {
                    street: formData.deliveryAddress.street,
                    city: formData.deliveryAddress.city,
                    zipCode: formData.deliveryAddress.zipCode,
                    fullAddress: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            };
            
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
                setFormData(prev => ({ 
                    ...prev, 
                    location: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        address: location.address
                    },
                    deliveryAddress: {
                        ...prev.deliveryAddress,
                        fullAddress: location.address
                    }
                }));
                setCustomerData(prev => ({ ...prev, deliveryAddress: updateData.deliveryAddress }));
            } else {
                setError('Failed to update delivery location');
            }
        } catch (error) {
            setError('Failed to update delivery location');
        }
    };

    const proceedToPayment = () => {
        // Check if delivery location is selected
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
            <div className="min-h-screen bg-white text-gray-900">
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
            <div className="min-h-screen bg-white text-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-xl text-red-600 mb-4">{error}</div>
                        <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
        <div className="min-h-screen bg-white text-gray-900">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="text-sm">
                        <Link to="/cart" className="text-green-600 hover:text-green-700">Cart</Link>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="text-gray-900">Customer Details</span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="text-gray-500">Payment</span>
                    </nav>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Customer Details Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Customer Details</h2>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Name Field */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        onBlur={() => saveField('name')}
                                        maxLength="100"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        onBlur={() => saveField('email')}
                                        maxLength="255"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                {/* Phone Field */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        onBlur={() => saveField('phone')}
                                        maxLength="10"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Street Address Field with Google Places Autocomplete */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Street Address</label>
                                        <Autocomplete
                                            onLoad={(ref) => { autocompleteRef.current = ref; }}
                                            onPlaceChanged={() => {
                                                const place = autocompleteRef.current?.getPlace?.();
                                                if (!place) return;
                                                const comps = place.address_components || [];
                                                const get = (type) => comps.find(c => c.types?.includes(type))?.long_name || '';
                                                const streetNumber = get('street_number');
                                                const route = get('route');
                                                const name = place.name || '';
                                                // Preserve landmark/place name as first part if available
                                                const composedStreetParts = [];
                                                if (name) composedStreetParts.push(name);
                                                if (streetNumber && route) {
                                                    composedStreetParts.push(`${streetNumber} ${route}`.trim());
                                                } else if (route) {
                                                    composedStreetParts.push(route);
                                                }
                                                const street = composedStreetParts.join(', ').trim();
                                                const city = get('locality') || get('administrative_area_level_2') || '';
                                                const zip = get('postal_code') || '';
                                                const formatted = place.formatted_address || [street, city, zip].filter(Boolean).join(', ');
                                                const loc = place.geometry?.location;
                                                if (street) handleInputChange('street', street);
                                                if (city) handleInputChange('city', city);
                                                if (zip) handleInputChange('zipCode', zip);
                                                // Update full address + coordinates via existing handler
                                                if (loc) {
                                                    handleLocationSelect({
                                                        latitude: loc.lat(),
                                                        longitude: loc.lng(),
                                                        address: formatted
                                                    });
                                                }
                                            }}
                                            options={{
                                                fields: ['address_components', 'formatted_address', 'geometry', 'name'],
                                                componentRestrictions: { country: 'LK' }
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={formData.deliveryAddress.street}
                                                onChange={(e) => handleInputChange('street', e.target.value)}
                                                onBlur={() => saveField('street')}
                                                maxLength="200"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                placeholder="Start typing your address..."
                                            />
                                        </Autocomplete>
                                </div>

                                {/* City Field */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">City</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryAddress.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        onBlur={() => saveField('city')}
                                        maxLength="100"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        placeholder="Enter city"
                                    />
                                </div>

                                {/* Zip Code Field */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryAddress.zipCode}
                                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                        onBlur={() => saveField('zipCode')}
                                        maxLength="5"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        placeholder="Enter zip code"
                                    />
                                </div>

                                {/* Delivery Location */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-4 text-gray-700">Delivery Location</label>
                                    {formData.location.address || (formData.deliveryAddress.street && formData.deliveryAddress.city) ? (
                                        <div className="text-gray-600 mb-4">
                                            📍 {formData.location.address || `${formData.deliveryAddress.street}, ${formData.deliveryAddress.city}${formData.deliveryAddress.zipCode ? ', ' + formData.deliveryAddress.zipCode : ''}`}
                                        </div>
                                    ) : (
                                        <div className="text-yellow-600 mb-4">
                                            ⚠️ Please select delivery location on map
                                        </div>
                                    )}
                                    
                                    {/* Map Section */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h3 className="text-lg font-bold mb-4 text-gray-900">Select Delivery Location</h3>
                                        <GoogleMapSelector
                                            onLocationSelect={handleLocationSelect}
                                            initialLocation={formData.location}
                                            address={formData.location.address}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 sticky top-4">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>
                            
                            {cart && cart.items && cart.items.length > 0 && (
                                <>
                                    <div className="space-y-3 mb-6">
                                        {cart.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-300">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.productId.productName}</div>
                                                    <div className="text-gray-600">Qty: {item.quantity}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-gray-700">
                                            <span>Subtotal ({cart.totalItems} items):</span>
                                            <span>LKR {cart.totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Delivery Fee:</span>
                                            <span className="text-green-600 font-medium">FREE</span>
                                        </div>
                                        <hr className="border-gray-300" />
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total:</span>
                                            <span>LKR {cart.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={proceedToPayment}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Continue to Payment
                                    </button>
                                </>
                            )}

                           
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
        </LoadScript>
    );
};

export default CheckoutCustomerDetails;
