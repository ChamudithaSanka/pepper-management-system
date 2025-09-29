import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Cart = () => {
    const getImageSrc = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
        return `/uploads/${imageUrl}`;
    };
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            // Get customer session first
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to view your cart');
                setLoading(false);
                return;
            }

            const customerId = sessionData.customer.customerId;
            const response = await fetch(`/api/customers/${customerId}/cart`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setCart(data.data);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(prev => ({ ...prev, [productId]: true }));
        
        try {
            // Get customer session first
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to update cart');
                return;
            }

            const customerId = sessionData.customer.customerId;
            const response = await fetch(`/api/customers/${customerId}/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity })
            });

            const data = await response.json();
            if (data.success) {
                setCart(data.data);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to update quantity');
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const removeItem = async (productId) => {
        setUpdating(prev => ({ ...prev, [productId]: true }));
        
        try {
            // Get customer session first
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to remove items');
                return;
            }

            const customerId = sessionData.customer.customerId;
            const response = await fetch(`/api/customers/${customerId}/cart/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setCart(data.data);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to remove item');
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;

        try {
            // Get customer session first
            const sessionResponse = await fetch('/api/customers/session', {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.success || !sessionData.isLoggedIn) {
                setError('Please login to clear cart');
                return;
            }

            const customerId = sessionData.customer.customerId;
            const response = await fetch(`/api/customers/${customerId}/cart`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setCart({ items: [], totalItems: 0, totalPrice: 0 });
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to clear cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 text-gray-900">
                <Header />
                <div className="flex items-center justify-center py-24">
                    <div className="text-xl">Loading cart...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 text-gray-900">
                <Header />
                <div className="flex items-center justify-center py-24">
                    <div className="text-center bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-8 border border-red-200">
                        <div className="text-xl text-red-600 mb-4">{error}</div>
                        {error.includes('login') && (
                            <Link to="/login" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                                Login
                            </Link>
                        )}
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
                <div className="flex justify-between items-center mb-8 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border border-green-200">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <Link to="/shop" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                        Continue Shopping
                    </Link>
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-200">
                        <div className="text-2xl mb-4 text-gray-900">Your cart is empty</div>
                        <Link to="/shop" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg border border-green-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cart.totalItems})</h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-600 hover:text-red-700 transition-colors font-medium"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item.productId._id} className="border border-green-200 bg-gradient-to-r from-white to-green-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                                                    {item.productId.imageUrl ? (
                                                        <img
                                                            src={getImageSrc(item.productId.imageUrl)}
                                                            alt={item.productId.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">🌶️</span>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-1">
                                                        <Link 
                                                            to={`/product/${item.productId._id}`}
                                                            className="hover:text-green-700 transition-colors text-gray-900"
                                                        >
                                                            {item.productId.productName}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {item.productId.category} • {item.productId.variety}
                                                    </p>
                                                    <p className="text-green-700 font-bold">
                                                        LKR {item.price.toFixed(2)} per {item.productId.unit}
                                                    </p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                                                            disabled={updating[item.productId._id] || item.quantity <= 1}
                                                            className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded flex items-center justify-center transition-all duration-200 shadow-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                                                            disabled={updating[item.productId._id] || item.quantity >= item.productId.currentStock}
                                                            className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded flex items-center justify-center transition-all duration-200 shadow-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</div>
                                                        <button
                                                            onClick={() => removeItem(item.productId._id)}
                                                            disabled={updating[item.productId._id]}
                                                            className="text-red-600 hover:text-red-700 text-sm transition-colors disabled:cursor-not-allowed"
                                                        >
                                                            {updating[item.productId._id] ? 'Removing...' : 'Remove'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg border border-blue-200 p-6 sticky top-4">
                                <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Subtotal ({cart.totalItems} items):</span>
                                        <span className="text-gray-900">LKR {cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Delivery Fee:</span>
                                        <span className="text-green-600 font-medium">FREE</span>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total:</span>
                                        <span>LKR {cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Link 
                                    to="/checkout" 
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all duration-200 text-center block shadow-md hover:shadow-lg"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Cart;
