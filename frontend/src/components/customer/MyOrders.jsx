import React, { useState, useEffect } from 'react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Get customer session
      const sessionResponse = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();

      if (!sessionData.success || !sessionData.isLoggedIn) {
        setLoading(false);
        return;
      }

      const customerId = sessionData.customer.customerId;

      // Fetch customer orders
      const ordersResponse = await fetch(`/api/orders/customer/${customerId}`, {
        credentials: 'include'
      });
      const ordersData = await ordersResponse.json();

      if (ordersData.success && ordersData.data && Array.isArray(ordersData.data.orders)) {
        setOrders(ordersData.data.orders);
      } else {
        console.log('No orders data or invalid format:', ordersData);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Processing':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(order.orderStatus);
    if (filter === 'delivered') return order.orderStatus === 'Delivered';
    if (filter === 'cancelled') return order.orderStatus === 'Cancelled';
    return true;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'delivered'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.orderId}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    LKR {order.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity} × LKR {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        LKR {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Delivery Address:</span>
                  <div className="text-gray-600 mt-1">
                    {order.deliveryAddress?.fullAddress || 'Address not available'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estimated Delivery:</span>
                  <div className="text-gray-600 mt-1">
                    {order.estimatedDeliveryDate 
                      ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
                      : 'Not available'
                    }
                  </div>
                  {order.actualDeliveryDate && (
                    <>
                      <span className="font-medium text-gray-700 block mt-2">Delivered On:</span>
                      <div className="text-green-600 mt-1">
                        {new Date(order.actualDeliveryDate).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'Failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-lg mb-2">
            {filter === 'all' ? 'No orders found' : `No ${filter} orders found`}
          </div>
          <p className="text-gray-400 text-sm">
            {filter === 'all' 
              ? 'Start shopping to see your orders here!'
              : `You don't have any ${filter} orders at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Start Shopping
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
