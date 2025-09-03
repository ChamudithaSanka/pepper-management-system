import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
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
            <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
                <div className="text-xl">Loading cart...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-400 mb-4">{error}</div>
                    {error.includes('login') && (
                        <Link to="/customer/login" className="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-green-400">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded transition-colors">
                        Continue Shopping
                    </Link>
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-2xl mb-4">Your cart is empty</div>
                        <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Cart Items ({cart.totalItems})</h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item.productId._id} className="border border-green-600 rounded-lg p-4">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">🌶️</span>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-1">
                                                        <Link 
                                                            to={`/product/${item.productId._id}`}
                                                            className="hover:text-green-300 transition-colors"
                                                        >
                                                            {item.productId.productName}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mb-2">
                                                        {item.productId.category} • {item.productId.variety}
                                                    </p>
                                                    <p className="text-green-400 font-bold">
                                                        ₹{item.price.toFixed(2)} per {item.productId.unit}
                                                    </p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                                                            disabled={updating[item.productId._id] || item.quantity <= 1}
                                                            className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded flex items-center justify-center transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-12 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                                                            disabled={updating[item.productId._id] || item.quantity >= item.productId.currentStock}
                                                            className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded flex items-center justify-center transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                        <button
                                                            onClick={() => removeItem(item.productId._id)}
                                                            disabled={updating[item.productId._id]}
                                                            className="text-red-400 hover:text-red-300 text-sm transition-colors disabled:cursor-not-allowed"
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
                            <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
                                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                                
                                <div className="space-y-3 mb-6">
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

                                <Link 
                                    to="/checkout" 
                                    className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded transition-colors text-center block"
                                >
                                    Proceed to Checkout
                                </Link>

                                <div className="mt-4 text-sm text-gray-400 text-center">
                                    <p>Free delivery on all orders</p>
                                    <p>Secure payment processing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
