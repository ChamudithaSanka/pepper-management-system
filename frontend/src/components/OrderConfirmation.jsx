import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Try to get data from navigation state first
        if (location.state && location.state.orderDetails && location.state.paymentDetails) {
            setOrderDetails(location.state.orderDetails);
            setPaymentDetails(location.state.paymentDetails);
            setLoading(false);
        } else {
            // Fetch order details from API
            fetchOrderDetails();
        }
    }, [orderId, location.state]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                setOrderDetails(result.data);
                // Try to fetch payment details
                fetchPaymentDetails();
            } else {
                setError('Order not found');
            }
        } catch (error) {
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentDetails = async () => {
        try {
            // Get customer session to fetch payment details
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();

            if (sessionData.success && sessionData.isLoggedIn) {
                const customerId = sessionData.customer.customerId;
                const paymentsResponse = await fetch(`/api/payments/customer/${customerId}`, {
                    credentials: 'include'
                });
                const paymentsResult = await paymentsResponse.json();

                if (paymentsResult.success) {
                    // Find payment for this order
                    const orderPayment = paymentsResult.data.payments.find(
                        payment => payment.orderId === orderId
                    );
                    if (orderPayment) {
                        setPaymentDetails(orderPayment);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment details:', error);
        }
    };

    const getImageSrc = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
        return `/uploads/${imageUrl}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-600';
            case 'Confirmed': return 'text-blue-600';
            case 'Processing': return 'text-orange-600';
            case 'Shipped': return 'text-purple-600';
            case 'Delivered': return 'text-green-600';
            case 'Cancelled': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-600';
            case 'Completed': return 'text-green-600';
            case 'Failed': return 'text-red-600';
            case 'Processing': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 text-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl bg-gradient-to-r from-white to-green-50 rounded-lg shadow-lg p-8 border border-green-200">Loading order confirmation...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !orderDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 text-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-8 border border-red-200">
                        <div className="text-xl text-red-600 mb-4">{error}</div>
                        <Link to="/shop" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 text-gray-900">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Success Header */}
                <div className="text-center mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border border-green-200">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-700">Thank you for your order.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg border border-green-200 p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Order Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-sm text-gray-600 font-medium">Order ID</div>
                                    <div className="font-mono text-green-600 font-bold">{orderDetails.orderId}</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-sm text-gray-600 font-medium">Order Date</div>
                                    <div className="text-gray-900 font-semibold">{formatDate(orderDetails.createdAt)}</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-sm text-gray-600 font-medium">Order Status</div>
                                    <div className={`font-bold ${getStatusColor(orderDetails.orderStatus)}`}>
                                        {orderDetails.orderStatus}
                                    </div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-sm text-gray-600 font-medium">Estimated Delivery</div>
                                    <div className="text-gray-900 font-semibold">{formatDate(orderDetails.estimatedDeliveryDate)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        {paymentDetails && (
                            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg border border-blue-200 p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-900">Payment Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="text-sm text-gray-600 font-medium">Payment ID</div>
                                        <div className="font-mono text-blue-600 font-bold">{paymentDetails.paymentId}</div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="text-sm text-gray-600 font-medium">Payment Method</div>
                                        <div className="text-gray-900 font-semibold">{paymentDetails.paymentMethod}</div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="text-sm text-gray-600 font-medium">Payment Status</div>
                                        <div className={`font-bold ${getPaymentStatusColor(paymentDetails.paymentStatus)}`}>
                                            {paymentDetails.paymentStatus}
                                        </div>
                                    </div>
                                    {paymentDetails.transactionId && (
                                        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
                                            <div className="text-sm text-gray-600 font-medium">Transaction ID</div>
                                            <div className="font-mono text-sm text-gray-800 font-semibold">{paymentDetails.transactionId}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Delivery Information */}
                        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg border border-green-200 p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Delivery Information</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-sm text-gray-600 font-medium mb-1">Delivery Address</div>
                                    <div className="text-gray-900 font-semibold">📍 {orderDetails.deliveryAddress.fullAddress || orderDetails.deliveryAddress}</div>
                                </div>
                                {orderDetails.deliveryLocation && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="text-sm text-gray-600 font-medium mb-1">Delivery Location</div>
                                        <div className="text-sm text-gray-800 font-medium">
                                            �️ Coordinates: {orderDetails.deliveryLocation.latitude.toFixed(6)}, {orderDetails.deliveryLocation.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg border border-blue-200 p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Order Items</h2>
                            <div className="space-y-4">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-green-300 shadow-sm overflow-hidden">
                                            {item.productImage ? (
                                                <img
                                                    src={getImageSrc(item.productImage)}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-green-600 rounded-full mx-auto flex items-center justify-center">
                                                        <span className="text-xl">🌶️</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-600 font-medium">
                                                LKR {item.price.toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">LKR {item.subtotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg border border-green-200 p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 shadow-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({orderDetails.items.length} items):</span>
                                    <span className="font-semibold">LKR {orderDetails.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Fee:</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                                <hr className="border-green-400" />
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total Paid:</span>
                                    <span className="text-green-600">LKR {orderDetails.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link
                                    to={`/orders/${orderDetails.orderId}`}
                                    className="w-full"
                                >
                                    Track Order
                                </Link>
                                <Link
                                    to="/shop"
                                    className="w-full border-2 border-green-500 bg-green-500 text-black hover:text-white font-medium py-3 rounded-lg transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md text-center block"
                                >
                                    Continue Shopping
                                </Link>
                            </div>                        
                        </div>
                    </div>
                </div>                
            </div>

            <Footer />
        </div>
    );
};

export default OrderConfirmation;
