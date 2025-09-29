import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CheckoutPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const formatAddress = (addr) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        const parts = [addr.street, addr.city, addr.zipCode].filter(Boolean);
        return addr.fullAddress || parts.join(', ');
    };

    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'Credit Card',
        cardDetails: {
            cardholderName: '',
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            cardType: ''
        },
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Sri Lanka',
            fullAddress: ''
        },
        useSameAsDelivery: true
    });

    useEffect(() => {
        // Get checkout data from navigation state
        if (location.state && location.state.customerDetails && location.state.cart) {
            setCustomerDetails(location.state.customerDetails);
            setCart(location.state.cart);
            
            // Auto-fill billing address with delivery address if selected
            if (paymentData.useSameAsDelivery) {
                setPaymentData(prev => ({
                    ...prev,
                    billingAddress: {
                        ...prev.billingAddress,
                        fullAddress: formatAddress(location.state.customerDetails.deliveryAddress)
                    }
                }));
            }
        } else {
            // Redirect back to checkout if no data
            navigate('/checkout');
        }
    }, [location.state, navigate, paymentData.useSameAsDelivery]);

    // Validation functions
    const validateCardholderName = (value) => {
        // Only allow letters, spaces, hyphens, and apostrophes
        return value.replace(/[^a-zA-Z\s\-']/g, '');
    };

    const validateCardNumber = (value) => {
        // Remove all non-digits
        const digitsOnly = value.replace(/\D/g, '');
        
        // Limit to 16 digits
        const limitedDigits = digitsOnly.slice(0, 16);
        
        // Format with spaces every 4 digits
        return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const validateCVV = (value) => {
        // Only allow digits, limit to 4 characters
        return value.replace(/\D/g, '').slice(0, 4);
    };

    const validateBillingStreet = (value) => {
        // Allow letters, numbers, spaces, hyphens, apostrophes, periods, and common address characters
        return value.replace(/[^a-zA-Z0-9\s\-'.,#/]/g, '');
    };

    const validateBillingCity = (value) => {
        // Only allow letters, spaces, and hyphens
        return value.replace(/[^a-zA-Z\s\-]/g, '');
    };

    const validateBillingState = (value) => {
        // Only allow letters, spaces, and hyphens
        return value.replace(/[^a-zA-Z\s\-]/g, '');
    };

    const validateBillingZipCode = (value) => {
        // Only allow digits, limit to 5 characters
        return value.replace(/\D/g, '').slice(0, 5);
    };


    const handleInputChange = (section, field, value) => {
        let validatedValue = value;

        // Apply validation based on field type
        if (section === 'cardDetails') {
            switch (field) {
                case 'cardholderName':
                    validatedValue = validateCardholderName(value);
                    break;
                case 'cardNumber':
                    validatedValue = validateCardNumber(value);
                    break;
                case 'cvv':
                    validatedValue = validateCVV(value);
                    break;
                case 'expiryMonth':
                case 'expiryYear':
                    // No validation needed for dropdown fields
                    validatedValue = value;
                    break;
                default:
                    validatedValue = value;
            }
        } else if (section === 'billingAddress') {
            switch (field) {
                case 'street':
                    validatedValue = validateBillingStreet(value);
                    break;
                case 'city':
                    validatedValue = validateBillingCity(value);
                    break;
                case 'state':
                    validatedValue = validateBillingState(value);
                    break;
                case 'zipCode':
                    validatedValue = validateBillingZipCode(value);
                    break;
                default:
                    validatedValue = value;
            }
        }

        if (section) {
            setPaymentData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: validatedValue
                }
            }));
        } else {
            setPaymentData(prev => ({
                ...prev,
                [field]: validatedValue
            }));
        }
    };

    const detectCardType = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        
        if (cleanNumber.match(/^4/)) return 'Visa';
        if (cleanNumber.match(/^5[1-5]/)) return 'MasterCard';
        if (cleanNumber.match(/^3[47]/)) return 'American Express';
        if (cleanNumber.match(/^6/)) return 'Discover';
        
        return '';
    };

    const formatCardNumber = (value) => {
        const cleanValue = value.replace(/\s/g, '');
        const groups = cleanValue.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleanValue;
    };

    const handleCardNumberChange = (value) => {
        const validatedValue = validateCardNumber(value);
        const cardType = detectCardType(value);
        
        handleInputChange('cardDetails', 'cardNumber', validatedValue);
        handleInputChange('cardDetails', 'cardType', cardType);
    };

    const toggleBillingAddress = () => {
        const newValue = !paymentData.useSameAsDelivery;
        setPaymentData(prev => ({
            ...prev,
            useSameAsDelivery: newValue,
            billingAddress: newValue ? {
                ...prev.billingAddress,
                fullAddress: formatAddress(customerDetails.deliveryAddress)
            } : {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Sri Lanka',
                fullAddress: ''
            }
        }));
    };

    const validatePaymentData = () => {
        // Basic validation - check if required fields are filled
        if (paymentData.paymentMethod === 'Credit Card' || paymentData.paymentMethod === 'Debit Card') {
            if (!paymentData.cardDetails.cardholderName || 
                !paymentData.cardDetails.cardNumber || 
                !paymentData.cardDetails.expiryMonth || 
                !paymentData.cardDetails.expiryYear || 
                !paymentData.cardDetails.cvv) {
                setError('Please fill in all card details');
                return false;
            }
        }

        return true;
    };

    const processOrder = async () => {
        if (!validatePaymentData()) return;

        setLoading(true);
        setError('');

        try {
            // Get customer session
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();

            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to complete order');
                return;
            }

            const customerId = sessionData.customer.customerId;

            // Step 1: Create order from cart
            const orderResponse = await fetch(`/api/orders/create/${customerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    deliveryAddress: customerDetails.deliveryAddress,
                    deliveryLocation: customerDetails.location,
                    notes: 'Order placed through website'
                })
            });

            const orderResult = await orderResponse.json();
            
            if (!orderResult.success) {
                setError(orderResult.message || 'Failed to create order');
                return;
            }

            const orderId = orderResult.data.orderId;

            // Step 2: Process payment
            const paymentResponse = await fetch(`/api/payments/process/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    customerId: customerId,
                    paymentMethod: paymentData.paymentMethod,
                    billingAddress: paymentData.useSameAsDelivery 
                        ? { fullAddress: customerDetails.deliveryAddress }
                        : paymentData.billingAddress,
                    cardDetails: (paymentData.paymentMethod === 'Credit Card' || paymentData.paymentMethod === 'Debit Card') 
                        ? {
                            cardholderName: paymentData.cardDetails.cardholderName,
                            cardNumber: paymentData.cardDetails.cardNumber.replace(/\s/g, ''),
                            cardType: paymentData.cardDetails.cardType,
                            expiryMonth: parseInt(paymentData.cardDetails.expiryMonth),
                            expiryYear: parseInt(paymentData.cardDetails.expiryYear)
                        }
                        : undefined
                })
            });

            const paymentResult = await paymentResponse.json();

            if (paymentResult.success) {
                setSuccess('Order placed successfully!');
                
                // Redirect to order confirmation
                setTimeout(() => {
                    navigate(`/order-confirmation/${orderId}`, {
                        state: {
                            orderDetails: orderResult.data,
                            paymentDetails: paymentResult.data
                        }
                    });
                }, 2000);
            } else {
                setError(paymentResult.message || 'Payment failed');
            }

        } catch (error) {
            setError('Failed to process order. Please try again.');
            console.error('Order processing error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!customerDetails || !cart) {
        return (
            <div className="min-h-screen bg-white text-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading payment details...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="text-sm">
                        <Link to="/cart" className="text-green-600 hover:text-green-700">Cart</Link>
                        <span className="mx-2 text-gray-500">→</span>
                        <Link to="/checkout" className="text-green-600 hover:text-green-700">Customer Details</Link>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="text-gray-900">Payment</span>
                    </nav>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Payment Details</h2>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                                    {success}
                                </div>
                            )}

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-3">Payment Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'].map((method) => (
                                        <label key={method} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={paymentData.paymentMethod === method}
                                                onChange={(e) => handleInputChange(null, 'paymentMethod', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`p-3 border rounded-lg text-center transition-colors ${
                                                paymentData.paymentMethod === method
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-600'
                                            }`}>
                                                {method}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Card Details (if card payment selected) */}
                            {(paymentData.paymentMethod === 'Credit Card' || paymentData.paymentMethod === 'Debit Card') && (
                                <div className="mb-6 space-y-4">
                                    <h3 className="text-lg font-medium">Card Information</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={paymentData.cardDetails.cardholderName}
                                            onChange={(e) => handleInputChange('cardDetails', 'cardholderName', e.target.value)}
                                            maxLength="100"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                            placeholder="Enter cardholder name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Card Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={paymentData.cardDetails.cardNumber}
                                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                            {paymentData.cardDetails.cardType && (
                                                <div className="absolute right-3 top-2 text-sm text-green-700">
                                                    {paymentData.cardDetails.cardType}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Expiry Month</label>
                                            <select
                                                value={paymentData.cardDetails.expiryMonth}
                                                onChange={(e) => handleInputChange('cardDetails', 'expiryMonth', e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                            >
                                                <option value="">MM</option>
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Expiry Year</label>
                                            <select
                                                value={paymentData.cardDetails.expiryYear}
                                                onChange={(e) => handleInputChange('cardDetails', 'expiryYear', e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                            >
                                                <option value="">YYYY</option>
                                                {[...Array(10)].map((_, i) => {
                                                    const year = new Date().getFullYear() + i;
                                                    return (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">CVV</label>
                                            <input
                                                type="text"
                                                value={paymentData.cardDetails.cvv}
                                                onChange={(e) => handleInputChange('cardDetails', 'cvv', e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                placeholder="123"
                                                maxLength="4"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cash on Delivery Info */}
                            {paymentData.paymentMethod === 'Cash on Delivery' && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h3 className="text-lg font-medium text-yellow-800 mb-2">Cash on Delivery</h3>
                                    <p className="text-yellow-800">
                                        You will pay LKR {cart.totalPrice.toFixed(2)} in cash when your order is delivered.
                                        Please have the exact amount ready for the delivery person.
                                    </p>
                                </div>
                            )}

                            {/* Billing Address */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                                
                                <div className="mb-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={paymentData.useSameAsDelivery}
                                            onChange={toggleBillingAddress}
                                            className="mr-2"
                                        />
                                        <span>Same as delivery address</span>
                                    </label>
                                </div>

                                {!paymentData.useSameAsDelivery && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.billingAddress.street}
                                                    onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                                                    maxLength="200"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.billingAddress.city}
                                                    onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                                                    maxLength="100"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">State/Province</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.billingAddress.state}
                                                    onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                                                    maxLength="100"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.billingAddress.zipCode}
                                                    onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                                                    maxLength="5"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentData.useSameAsDelivery && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="text-gray-700">{formatAddress(customerDetails.deliveryAddress)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                {cart.items.map((item) => (
                                    <div key={item.productId._id} className="flex justify-between text-sm">
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
                                    <span>Subtotal:</span>
                                    <span>LKR {cart.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery:</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Payment Method:</span>
                                    <span className="text-sm">{paymentData.paymentMethod}</span>
                                </div>
                                <hr className="border-gray-300" />
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span>LKR {cart.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={processOrder}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>

                         
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CheckoutPayment;
