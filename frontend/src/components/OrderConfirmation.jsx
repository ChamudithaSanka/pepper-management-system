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
            case 'Pending': return 'text-yellow-400';
            case 'Confirmed': return 'text-blue-400';
            case 'Processing': return 'text-orange-400';
            case 'Shipped': return 'text-purple-400';
            case 'Delivered': return 'text-green-400';
            case 'Cancelled': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-400';
            case 'Completed': return 'text-green-400';
            case 'Failed': return 'text-red-400';
            case 'Processing': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-green-400">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading order confirmation...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !orderDetails) {
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
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-green-400 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-400">Thank you for your order. We'll send you a confirmation email shortly.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Order Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-400">Order ID</div>
                                    <div className="font-mono text-green-400">{orderDetails.orderId}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Order Date</div>
                                    <div>{formatDate(orderDetails.createdAt)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Order Status</div>
                                    <div className={`font-medium ${getStatusColor(orderDetails.orderStatus)}`}>
                                        {orderDetails.orderStatus}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Estimated Delivery</div>
                                    <div>{formatDate(orderDetails.estimatedDeliveryDate)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        {paymentDetails && (
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Payment ID</div>
                                        <div className="font-mono text-green-400">{paymentDetails.paymentId}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Payment Method</div>
                                        <div>{paymentDetails.paymentMethod}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Payment Status</div>
                                        <div className={`font-medium ${getPaymentStatusColor(paymentDetails.paymentStatus)}`}>
                                            {paymentDetails.paymentStatus}
                                        </div>
                                    </div>
                                    {paymentDetails.transactionId && (
                                        <div>
                                            <div className="text-sm text-gray-400">Transaction ID</div>
                                            <div className="font-mono text-sm">{paymentDetails.transactionId}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Delivery Information */}
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Delivery Address</div>
                                    <div>{orderDetails.deliveryAddress.fullAddress || orderDetails.deliveryAddress}</div>
                                </div>
                                {orderDetails.deliveryLocation && (
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Delivery Location</div>
                                        <div className="text-sm">
                                            📍 Coordinates: {orderDetails.deliveryLocation.latitude.toFixed(6)}, {orderDetails.deliveryLocation.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">🌶️</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.productName}</h3>
                                            <p className="text-sm text-gray-400">
                                                ₹{item.price.toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">₹{item.subtotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal ({orderDetails.items.length} items):</span>
                                    <span>₹{orderDetails.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Fee:</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <hr className="border-green-600" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Paid:</span>
                                    <span>₹{orderDetails.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link
                                    to={`/orders/${orderDetails.orderId}`}
                                    className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded transition-colors text-center block"
                                >
                                    Track Order
                                </Link>
                                <Link
                                    to="/shop"
                                    className="w-full border border-green-600 text-green-400 hover:bg-green-600 hover:text-black font-medium py-3 rounded transition-colors text-center block"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            <div className="mt-6 text-xs text-gray-400">
                                <p>📧 Order confirmation sent to your email</p>
                                <p>📱 SMS updates for delivery status</p>
                                <p>📞 24/7 customer support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-8 bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">What's Next?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl mb-2">📋</div>
                            <h3 className="font-semibold mb-1">Order Processing</h3>
                            <p className="text-sm text-gray-400">We'll prepare your items for shipment</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">🚚</div>
                            <h3 className="font-semibold mb-1">Shipping</h3>
                            <p className="text-sm text-gray-400">Your order will be shipped within 1-2 business days</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">📦</div>
                            <h3 className="font-semibold mb-1">Delivery</h3>
                            <p className="text-sm text-gray-400">Estimated delivery by {formatDate(orderDetails.estimatedDeliveryDate)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrderConfirmation;
